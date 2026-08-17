import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createAuditLog } from '../utils/audit';

export const getAllocations = async (req: Request, res: Response) => {
  try {
    const { hostelId, status, search, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (hostelId) where.hostelId = String(hostelId);
    if (status) where.status = String(status);

    if (search) {
      where.OR = [
        { student: { enrollmentNo: { contains: String(search) } } },
        { student: { user: { firstName: { contains: String(search) } } } },
        { student: { user: { lastName: { contains: String(search) } } } },
        { room: { roomNumber: { contains: String(search) } } },
      ];
    }

    const [total, allocations] = await Promise.all([
      prisma.allocation.count({ where }),
      prisma.allocation.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true } },
            },
          },
          hostel: { select: { id: true, name: true, code: true } },
          floor: { select: { id: true, name: true, floorNumber: true } },
          room: { select: { id: true, roomNumber: true, type: true, capacity: true } },
          bed: { select: { id: true, bedNumber: true, status: true } },
          allocatedBy: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: allocations,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch allocations', error: error.message });
  }
};

export const allocateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, hostelId, floorId, roomId, bedId, startDate, expectedEndDate, remarks } = req.body;

    if (!studentId || !hostelId || !floorId || !roomId || !bedId) {
      return res.status(400).json({ success: false, message: 'Student, Hostel, Floor, Room, and Bed are required.' });
    }

    // Check Rule 1 & 2: Student already has an active allocation?
    const existingStudentAlloc = await prisma.allocation.findFirst({
      where: { studentId, status: 'ACTIVE' },
      include: { hostel: true, room: true },
    });

    if (existingStudentAlloc) {
      return res.status(400).json({
        success: false,
        message: `Student already has an active room allocation in ${existingStudentAlloc.hostel.name}, Room ${existingStudentAlloc.room.roomNumber}. Release or transfer first.`,
      });
    }

    // Check Rule 3: Bed must be AVAILABLE and not currently allocated
    const bed = await prisma.bed.findUnique({
      where: { id: bedId },
      include: {
        allocations: { where: { status: 'ACTIVE' } },
        room: true,
      },
    });

    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    if (bed.status !== 'AVAILABLE' || bed.allocations.length > 0) {
      return res.status(400).json({ success: false, message: 'Selected bed is already occupied or under maintenance.' });
    }

    // Execute allocation transaction
    const allocation = await prisma.$transaction(async (tx) => {
      // 1. Create allocation record
      const alloc = await tx.allocation.create({
        data: {
          studentId,
          hostelId,
          floorId,
          roomId,
          bedId,
          startDate: startDate ? new Date(startDate) : new Date(),
          expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : null,
          status: 'ACTIVE',
          remarks,
          allocatedById: req.user?.userId || null,
        },
        include: {
          student: { include: { user: true } },
          hostel: true,
          room: true,
          bed: true,
        },
      });

      // 2. Mark bed as OCCUPIED
      await tx.bed.update({
        where: { id: bedId },
        data: { status: 'OCCUPIED' },
      });

      // 3. Update room occupancy & status
      const occupiedBedsCount = await tx.bed.count({
        where: { roomId, status: 'OCCUPIED' },
      });

      const room = await tx.room.findUnique({ where: { id: roomId } });
      if (room) {
        let roomStatus = 'PARTIALLY_OCCUPIED';
        if (occupiedBedsCount >= room.capacity) roomStatus = 'FULL';
        await tx.room.update({
          where: { id: roomId },
          data: {
            currentOccupancy: occupiedBedsCount,
            status: roomStatus,
          },
        });
      }

      // 4. Create Notification for Student
      await tx.notification.create({
        data: {
          userId: alloc.student.userId,
          title: 'Room Allocated',
          message: `You have been allocated Room ${alloc.room.roomNumber} (Bed ${alloc.bed.bedNumber}) in ${alloc.hostel.name}.`,
          type: 'SUCCESS',
          link: '/my-room',
        },
      });

      return alloc;
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'ALLOCATE',
      module: 'ALLOCATIONS',
      recordId: allocation.id,
      details: `Allocated student ${allocation.student.user.firstName} to Room ${allocation.room.roomNumber}, Bed ${allocation.bed.bedNumber}`,
    });

    res.status(201).json({ success: true, message: 'Room allocated successfully', data: allocation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to allocate room', error: error.message });
  }
};

export const transferRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { allocationId, newHostelId, newFloorId, newRoomId, newBedId, remarks } = req.body;

    const oldAllocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
      include: { student: { include: { user: true } }, bed: true, room: true },
    });

    if (!oldAllocation || oldAllocation.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'Active allocation not found' });
    }

    // Check new bed availability
    const newBed = await prisma.bed.findUnique({
      where: { id: newBedId },
      include: { allocations: { where: { status: 'ACTIVE' } } },
    });

    if (!newBed || newBed.status !== 'AVAILABLE' || newBed.allocations.length > 0) {
      return res.status(400).json({ success: false, message: 'Target bed is not available.' });
    }

    const transferResult = await prisma.$transaction(async (tx) => {
      // 1. Mark old allocation as TRANSFERRED
      await tx.allocation.update({
        where: { id: allocationId },
        data: {
          status: 'TRANSFERRED',
          actualEndDate: new Date(),
          remarks: `${oldAllocation.remarks || ''} [Transferred on ${new Date().toLocaleDateString()}]`,
        },
      });

      // 2. Free old bed
      await tx.bed.update({
        where: { id: oldAllocation.bedId },
        data: { status: 'AVAILABLE' },
      });

      // 3. Update old room occupancy
      const oldRoomBedsCount = await tx.bed.count({
        where: { roomId: oldAllocation.roomId, status: 'OCCUPIED' },
      });
      const oldRoom = await tx.room.findUnique({ where: { id: oldAllocation.roomId } });
      if (oldRoom) {
        await tx.room.update({
          where: { id: oldAllocation.roomId },
          data: {
            currentOccupancy: Math.max(0, oldRoomBedsCount - 1),
            status: oldRoomBedsCount - 1 <= 0 ? 'AVAILABLE' : 'PARTIALLY_OCCUPIED',
          },
        });
      }

      // 4. Create new allocation
      const newAlloc = await tx.allocation.create({
        data: {
          studentId: oldAllocation.studentId,
          hostelId: newHostelId,
          floorId: newFloorId,
          roomId: newRoomId,
          bedId: newBedId,
          startDate: new Date(),
          status: 'ACTIVE',
          remarks: `Transferred from Room ${oldAllocation.room.roomNumber}. ${remarks || ''}`,
          allocatedById: req.user?.userId || null,
        },
        include: { hostel: true, room: true, bed: true },
      });

      // 5. Occupy new bed
      await tx.bed.update({
        where: { id: newBedId },
        data: { status: 'OCCUPIED' },
      });

      // 6. Update new room occupancy
      const newRoomBedsCount = await tx.bed.count({
        where: { roomId: newRoomId, status: 'OCCUPIED' },
      });
      const targetRoom = await tx.room.findUnique({ where: { id: newRoomId } });
      if (targetRoom) {
        let status = 'PARTIALLY_OCCUPIED';
        if (newRoomBedsCount >= targetRoom.capacity) status = 'FULL';
        await tx.room.update({
          where: { id: newRoomId },
          data: {
            currentOccupancy: newRoomBedsCount,
            status,
          },
        });
      }

      return newAlloc;
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'UPDATE',
      module: 'ALLOCATIONS',
      recordId: transferResult.id,
      details: `Transferred student ${oldAllocation.student.user.firstName} to Room ${transferResult.room.roomNumber}, Bed ${transferResult.bed.bedNumber}`,
    });

    res.json({ success: true, message: 'Room transferred successfully', data: transferResult });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to transfer room', error: error.message });
  }
};

export const releaseAllocation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const allocation = await prisma.allocation.findUnique({
      where: { id },
      include: { student: { include: { user: true } }, room: true, bed: true },
    });

    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Mark allocation as RELEASED
      await tx.allocation.update({
        where: { id },
        data: {
          status: 'RELEASED',
          actualEndDate: new Date(),
          remarks: remarks || allocation.remarks,
        },
      });

      // 2. Release bed
      await tx.bed.update({
        where: { id: allocation.bedId },
        data: { status: 'AVAILABLE' },
      });

      // 3. Update room occupancy
      const occupiedCount = await tx.bed.count({
        where: { roomId: allocation.roomId, status: 'OCCUPIED' },
      });
      const room = await tx.room.findUnique({ where: { id: allocation.roomId } });
      if (room) {
        await tx.room.update({
          where: { id: allocation.roomId },
          data: {
            currentOccupancy: Math.max(0, occupiedCount - 1),
            status: occupiedCount - 1 === 0 ? 'AVAILABLE' : 'PARTIALLY_OCCUPIED',
          },
        });
      }

      // 4. Notification
      await tx.notification.create({
        data: {
          userId: allocation.student.userId,
          title: 'Room Released',
          message: `Your allocation for Room ${allocation.room.roomNumber} has been released.`,
          type: 'INFO',
        },
      });
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'DELETE',
      module: 'ALLOCATIONS',
      recordId: id,
      details: `Released allocation for student ${allocation.student.user.firstName} from Room ${allocation.room.roomNumber}`,
    });

    res.json({ success: true, message: 'Allocation released successfully and bed is now available.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to release allocation', error: error.message });
  }
};
