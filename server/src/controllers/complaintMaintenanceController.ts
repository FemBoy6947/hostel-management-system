import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createAuditLog } from '../utils/audit';

// ---------------------------------------------------------
// COMPLAINTS
// ---------------------------------------------------------

export const getComplaints = async (req: Request, res: Response) => {
  try {
    const { category, priority, status, hostelId, studentId, search, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (category) where.category = String(category);
    if (priority) where.priority = String(priority);
    if (status) where.status = String(status);
    if (hostelId) where.hostelId = String(hostelId);
    if (studentId) where.studentId = String(studentId);

    if (search) {
      where.OR = [
        { ticketNo: { contains: String(search) } },
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
        { student: { user: { firstName: { contains: String(search) } } } },
        { student: { user: { lastName: { contains: String(search) } } } },
      ];
    }

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
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
          room: { select: { id: true, roomNumber: true } },
          assignedStaff: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
          comments: {
            include: { user: { select: { firstName: true, lastName: true, role: true, avatar: true } } },
            orderBy: { createdAt: 'asc' },
          },
          maintenanceTasks: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch complaints', error: error.message });
  }
};

export const createComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, hostelId, roomId, category, priority, title, description, imageUrl } = req.body;

    let targetStudentId = studentId;
    let targetHostelId = hostelId;
    let targetRoomId = roomId;

    if (req.user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: req.user.userId },
        include: { allocations: { where: { status: 'ACTIVE' } } },
      });

      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
      targetStudentId = student.id;

      if (student.allocations.length > 0) {
        targetHostelId = student.allocations[0].hostelId;
        targetRoomId = student.allocations[0].roomId;
      }
    }

    if (!targetHostelId) {
      const defaultHostel = await prisma.hostel.findFirst();
      targetHostelId = defaultHostel?.id;
    }

    const ticketNo = `CMP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const complaint = await prisma.complaint.create({
      data: {
        ticketNo,
        studentId: targetStudentId,
        hostelId: targetHostelId,
        roomId: targetRoomId || null,
        category: category || 'ROOM',
        priority: priority || 'MEDIUM',
        title,
        description,
        imageUrl,
        status: 'OPEN',
      },
      include: {
        student: { include: { user: true } },
        hostel: true,
      },
    });

    res.status(201).json({ success: true, message: 'Complaint registered successfully', data: complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create complaint', error: error.message });
  }
};

export const updateComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedStaffId, staffRemarks } = req.body;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { student: { include: { user: true } } },
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignedStaffId !== undefined) updateData.assignedStaffId = assignedStaffId;
    if (staffRemarks !== undefined) updateData.staffRemarks = staffRemarks;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolutionDate = new Date();
      updateData.resolvedById = req.user?.userId;
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: updateData,
    });

    // Notify student
    if (status) {
      await prisma.notification.create({
        data: {
          userId: complaint.student.userId,
          title: `Complaint Ticket #${complaint.ticketNo} Updated`,
          message: `Your complaint has been marked as ${status}. ${staffRemarks ? `Remarks: ${staffRemarks}` : ''}`,
          type: status === 'RESOLVED' ? 'SUCCESS' : 'INFO',
          link: '/complaints',
        },
      });
    }

    res.json({ success: true, message: 'Complaint updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update complaint', error: error.message });
  }
};

export const addComplaintComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Comment message is required' });
    }

    const comment = await prisma.complaintComment.create({
      data: {
        complaintId: id,
        userId: req.user!.userId,
        message,
      },
      include: {
        user: { select: { firstName: true, lastName: true, role: true, avatar: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Comment added', data: comment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add comment', error: error.message });
  }
};

// ---------------------------------------------------------
// MAINTENANCE TASKS
// ---------------------------------------------------------

export const getMaintenanceTasks = async (req: Request, res: Response) => {
  try {
    const { status, priority, hostelId, assignedToId, search } = req.query;
    const where: any = {};

    if (status) where.status = String(status);
    if (priority) where.priority = String(priority);
    if (hostelId) where.hostelId = String(hostelId);
    if (assignedToId) where.assignedToId = String(assignedToId);

    if (search) {
      where.OR = [
        { taskNumber: { contains: String(search) } },
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const tasks = await prisma.maintenanceTask.findMany({
      where,
      include: {
        hostel: { select: { id: true, name: true } },
        room: { select: { id: true, roomNumber: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        complaint: { select: { id: true, ticketNo: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Summary statistics
    const totalCost = tasks.reduce((sum, t) => sum + t.actualCost, 0);
    const pendingTasksCount = tasks.filter((t) => t.status === 'PENDING').length;
    const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

    res.json({
      success: true,
      data: tasks,
      summary: {
        totalTasks: tasks.length,
        pendingTasksCount,
        inProgressCount,
        completedCount,
        totalMaintenanceCost: totalCost,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch maintenance tasks', error: error.message });
  }
};

export const createMaintenanceTask = async (req: AuthRequest, res: Response) => {
  try {
    const { complaintId, hostelId, roomId, title, description, priority, assignedToId, estimatedCost, estimatedCompletion, notes } = req.body;

    const taskNumber = `MT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const task = await prisma.maintenanceTask.create({
      data: {
        taskNumber,
        complaintId: complaintId || null,
        hostelId,
        roomId: roomId || null,
        title,
        description,
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        assignedToId: assignedToId || null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
        estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : null,
        notes,
      },
      include: {
        hostel: true,
        room: true,
        assignedTo: true,
      },
    });

    res.status(201).json({ success: true, message: 'Maintenance task created successfully', data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create maintenance task', error: error.message });
  }
};

export const updateMaintenanceTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, actualCost, notes, actualCompletion } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (actualCost !== undefined) updateData.actualCost = parseFloat(actualCost);
    if (notes !== undefined) updateData.notes = notes;
    if (status === 'COMPLETED') {
      updateData.actualCompletion = actualCompletion ? new Date(actualCompletion) : new Date();
    }

    const task = await prisma.maintenanceTask.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, message: 'Maintenance task updated successfully', data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update maintenance task', error: error.message });
  }
};
