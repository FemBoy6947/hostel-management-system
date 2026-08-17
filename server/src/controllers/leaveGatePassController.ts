import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createAuditLog } from '../utils/audit';

// ---------------------------------------------------------
// LEAVE REQUESTS
// ---------------------------------------------------------

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const { status, studentId, search, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (status) where.status = String(status);
    if (studentId) where.studentId = String(studentId);

    if (search) {
      where.OR = [
        { student: { enrollmentNo: { contains: String(search) } } },
        { student: { user: { firstName: { contains: String(search) } } } },
        { student: { user: { lastName: { contains: String(search) } } } },
        { reason: { contains: String(search) } },
      ];
    }

    const [total, leaves] = await Promise.all([
      prisma.leaveRequest.count({ where }),
      prisma.leaveRequest.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true } },
              allocations: { where: { status: 'ACTIVE' }, include: { hostel: true, room: true } },
            },
          },
          approvedBy: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: leaves,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave requests', error: error.message });
  }
};

export const applyLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, leaveType, startDate, endDate, reason, emergencyPhone, parentPhone } = req.body;

    let targetStudentId = studentId;
    if (req.user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
      if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
      targetStudentId = student.id;
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        studentId: targetStudentId,
        leaveType: leaveType || 'HOME_VISIT',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        emergencyPhone,
        parentPhone,
        status: 'PENDING',
      },
      include: {
        student: { include: { user: true } },
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'CREATE',
      module: 'LEAVES',
      recordId: leave.id,
      details: `Submitted leave request for ${leave.student.user.firstName}`,
    });

    res.status(201).json({ success: true, message: 'Leave application submitted successfully', data: leave });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit leave request', error: error.message });
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, wardenRemarks } = req.body; // APPROVED, REJECTED, CANCELLED

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { student: { include: { user: true } } },
    });

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        wardenRemarks,
        approvedById: req.user?.userId || null,
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: leave.student.userId,
        title: `Leave Request ${status}`,
        message: `Your leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been ${status.toLowerCase()}.`,
        type: status === 'APPROVED' ? 'SUCCESS' : 'DANGER',
        link: '/leaves',
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: status,
      module: 'LEAVES',
      recordId: id,
      details: `Leave request ${status} for student ${leave.student.user.firstName}`,
    });

    res.json({ success: true, message: `Leave request marked as ${status}`, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update leave status', error: error.message });
  }
};

// ---------------------------------------------------------
// GATE PASSES
// ---------------------------------------------------------

export const getGatePasses = async (req: Request, res: Response) => {
  try {
    const { status, studentId, search, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (status) where.status = String(status);
    if (studentId) where.studentId = String(studentId);

    if (search) {
      where.OR = [
        { passNumber: { contains: String(search) } },
        { destination: { contains: String(search) } },
        { student: { enrollmentNo: { contains: String(search) } } },
        { student: { user: { firstName: { contains: String(search) } } } },
        { student: { user: { lastName: { contains: String(search) } } } },
      ];
    }

    const [total, gatePasses] = await Promise.all([
      prisma.gatePass.count({ where }),
      prisma.gatePass.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true } },
              allocations: { where: { status: 'ACTIVE' }, include: { hostel: true, room: true } },
            },
          },
          approvedBy: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: gatePasses,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch gate passes', error: error.message });
  }
};

export const applyGatePass = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, purpose, destination, departureDate, departureTime, expectedReturnDate, expectedReturnTime, remarks } = req.body;

    let targetStudentId = studentId;
    if (req.user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
      if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
      targetStudentId = student.id;
    }

    const passNumber = `GP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const gatePass = await prisma.gatePass.create({
      data: {
        passNumber,
        studentId: targetStudentId,
        purpose,
        destination,
        departureDate: new Date(departureDate),
        departureTime: departureTime || '18:00',
        expectedReturnDate: new Date(expectedReturnDate || departureDate),
        expectedReturnTime: expectedReturnTime || '21:00',
        status: 'REQUESTED',
        qrCode: `GP:${passNumber}`,
        remarks,
      },
      include: { student: { include: { user: true } } },
    });

    res.status(201).json({ success: true, message: 'Gate pass requested successfully', data: gatePass });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to request gate pass', error: error.message });
  }
};

export const updateGatePassStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // APPROVED, REJECTED, ACTIVE, RETURNED, EXPIRED

    const gatePass = await prisma.gatePass.findUnique({
      where: { id },
      include: { student: { include: { user: true } } },
    });

    if (!gatePass) {
      return res.status(404).json({ success: false, message: 'Gate pass not found' });
    }

    const updateData: any = { status };
    if (status === 'APPROVED') {
      updateData.approvedById = req.user?.userId;
    }
    if (status === 'RETURNED') {
      updateData.actualReturnTime = new Date();
    }
    if (remarks) updateData.remarks = remarks;

    const updated = await prisma.gatePass.update({
      where: { id },
      data: updateData,
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: gatePass.student.userId,
        title: `Gate Pass ${status}`,
        message: `Your gate pass #${gatePass.passNumber} has been updated to ${status}.`,
        type: status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'DANGER' : 'INFO',
        link: '/gate-passes',
      },
    });

    res.json({ success: true, message: `Gate pass status updated to ${status}`, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update gate pass status', error: error.message });
  }
};

// ---------------------------------------------------------
// VISITORS
// ---------------------------------------------------------

export const getVisitors = async (req: Request, res: Response) => {
  try {
    const { status, studentId, search, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (status) where.status = String(status);
    if (studentId) where.studentId = String(studentId);

    if (search) {
      where.OR = [
        { visitorName: { contains: String(search) } },
        { phone: { contains: String(search) } },
        { idProofNumber: { contains: String(search) } },
        { student: { user: { firstName: { contains: String(search) } } } },
        { student: { user: { lastName: { contains: String(search) } } } },
      ];
    }

    const [total, visitors] = await Promise.all([
      prisma.visitor.count({ where }),
      prisma.visitor.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { checkInTime: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true, phone: true } },
              allocations: { where: { status: 'ACTIVE' }, include: { hostel: true, room: true } },
            },
          },
          securityStaff: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: visitors,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch visitors', error: error.message });
  }
};

export const registerVisitor = async (req: AuthRequest, res: Response) => {
  try {
    const { visitorName, phone, email, idProofType, idProofNumber, studentId, relation, purpose, photoUrl, remarks } = req.body;

    const visitor = await prisma.visitor.create({
      data: {
        visitorName,
        phone,
        email,
        idProofType: idProofType || 'AADHAAR',
        idProofNumber,
        studentId,
        relation: relation || 'PARENT',
        purpose,
        photoUrl,
        checkInTime: new Date(),
        status: 'INSIDE',
        securityStaffId: req.user?.userId || null,
        remarks,
      },
      include: {
        student: { include: { user: true } },
      },
    });

    // Notify student of visitor arrival
    await prisma.notification.create({
      data: {
        userId: visitor.student.userId,
        title: 'Visitor Arrived',
        message: `${visitorName} (${relation}) has checked in to visit you at the security desk.`,
        type: 'INFO',
        link: '/visitors',
      },
    });

    res.status(201).json({ success: true, message: 'Visitor registered and checked in', data: visitor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to register visitor', error: error.message });
  }
};

export const checkOutVisitor = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const visitor = await prisma.visitor.update({
      where: { id },
      data: {
        status: 'CHECKED_OUT',
        checkOutTime: new Date(),
      },
    });

    res.json({ success: true, message: 'Visitor checked out successfully', data: visitor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to check out visitor', error: error.message });
  }
};
