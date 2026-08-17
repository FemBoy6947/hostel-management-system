import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createAuditLog } from '../utils/audit';

export const getAttendanceByDateAndHostel = async (req: Request, res: Response) => {
  try {
    const { hostelId, date, floorId } = req.query;

    if (!hostelId || !date) {
      return res.status(400).json({ success: false, message: 'Hostel ID and Date (YYYY-MM-DD) are required' });
    }

    const targetDate = new Date(String(date));
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get all students currently allocated to this hostel
    const allocationsWhere: any = {
      hostelId: String(hostelId),
      status: 'ACTIVE',
    };
    if (floorId) {
      allocationsWhere.floorId = String(floorId);
    }

    const allocations = await prisma.allocation.findMany({
      where: allocationsWhere,
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, avatar: true } },
          },
        },
        room: { select: { roomNumber: true } },
        bed: { select: { bedNumber: true } },
        floor: { select: { name: true, floorNumber: true } },
      },
      orderBy: [{ room: { roomNumber: 'asc' } }, { bed: { bedNumber: 'asc' } }],
    });

    // Get marked attendance for these students on this date
    const markedAttendance = await prisma.attendance.findMany({
      where: {
        hostelId: String(hostelId),
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const attendanceMap = new Map(markedAttendance.map((a) => [a.studentId, a]));

    const result = allocations.map((alloc) => {
      const attendance = attendanceMap.get(alloc.studentId);
      return {
        studentId: alloc.studentId,
        studentName: `${alloc.student.user.firstName} ${alloc.student.user.lastName}`,
        enrollmentNo: alloc.student.enrollmentNo,
        roomNumber: alloc.room.roomNumber,
        bedNumber: alloc.bed.bedNumber,
        floorName: alloc.floor.name,
        avatar: alloc.student.user.avatar,
        status: attendance ? attendance.status : 'NOT_MARKED',
        checkInTime: attendance?.checkInTime || null,
        remarks: attendance?.remarks || null,
        attendanceId: attendance?.id || null,
      };
    });

    res.json({ success: true, date: String(date), data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
  }
};

export const markBulkAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { hostelId, date, records } = req.body;
    // records: [{ studentId: string, status: 'PRESENT'|'ABSENT'|'LATE'|'LEAVE', remarks?: string }]

    if (!hostelId || !date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'HostelId, date, and records array are required' });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(new Date(targetDate).setHours(0, 0, 0, 0));

    await prisma.$transaction(async (tx) => {
      for (const record of records) {
        // Upsert daily attendance record
        const existing = await tx.attendance.findFirst({
          where: {
            studentId: record.studentId,
            date: {
              gte: startOfDay,
              lte: new Date(new Date(targetDate).setHours(23, 59, 59, 999)),
            },
          },
        });

        if (existing) {
          await tx.attendance.update({
            where: { id: existing.id },
            data: {
              status: record.status,
              remarks: record.remarks,
              markedById: req.user?.userId || null,
              checkInTime: record.status === 'PRESENT' || record.status === 'LATE' ? new Date() : null,
            },
          });
        } else {
          await tx.attendance.create({
            data: {
              studentId: record.studentId,
              hostelId,
              date: startOfDay,
              status: record.status,
              remarks: record.remarks,
              markedById: req.user?.userId || null,
              checkInTime: record.status === 'PRESENT' || record.status === 'LATE' ? new Date() : null,
            },
          });
        }
      }
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'UPDATE',
      module: 'ATTENDANCE',
      details: `Marked attendance for ${records.length} students in hostel ${hostelId} for date ${date}`,
    });

    res.json({ success: true, message: `Attendance saved successfully for ${records.length} students` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to mark attendance', error: error.message });
  }
};

export const getStudentAttendanceHistory = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;

    const where: any = { studentId };

    if (month && year) {
      const m = parseInt(String(month)) - 1;
      const y = parseInt(String(year));
      where.date = {
        gte: new Date(y, m, 1),
        lte: new Date(y, m + 1, 0, 23, 59, 59),
      };
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
    const absentDays = attendanceRecords.filter((a) => a.status === 'ABSENT').length;
    const lateDays = attendanceRecords.filter((a) => a.status === 'LATE').length;
    const leaveDays = attendanceRecords.filter((a) => a.status === 'LEAVE').length;
    const attendancePercentage = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 100;

    res.json({
      success: true,
      stats: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
        attendancePercentage,
      },
      records: attendanceRecords,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance history', error: error.message });
  }
};
