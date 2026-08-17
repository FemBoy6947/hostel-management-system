import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createAuditLog } from '../utils/audit';

// ---------------------------------------------------------
// MESS MENUS
// ---------------------------------------------------------

export const getMessMenu = async (req: Request, res: Response) => {
  try {
    const { hostelId, dayOfWeek } = req.query;
    const where: any = { isActive: true };
    if (hostelId) where.hostelId = String(hostelId);
    if (dayOfWeek) where.dayOfWeek = String(dayOfWeek);

    const menus = await prisma.messMenu.findMany({
      where,
      include: { hostel: { select: { id: true, name: true } } },
      orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
    });

    res.json({ success: true, data: menus });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch mess menu', error: error.message });
  }
};

export const updateMessMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const { hostelId, dayOfWeek, mealType, items, specialItem, calorieCount } = req.body;

    const updated = await prisma.messMenu.upsert({
      where: {
        hostelId_dayOfWeek_mealType: {
          hostelId,
          dayOfWeek,
          mealType,
        },
      },
      update: {
        items,
        specialItem,
        calorieCount: calorieCount ? parseInt(calorieCount) : null,
      },
      create: {
        hostelId,
        dayOfWeek,
        mealType,
        items,
        specialItem,
        calorieCount: calorieCount ? parseInt(calorieCount) : null,
        isActive: true,
      },
    });

    res.json({ success: true, message: 'Mess menu item updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update mess menu item', error: error.message });
  }
};

// ---------------------------------------------------------
// NOTICES & ANNOUNCEMENTS
// ---------------------------------------------------------

export const getNotices = async (req: Request, res: Response) => {
  try {
    const { targetAudience, hostelId, category, priority, isPinned } = req.query;
    const where: any = {};

    if (category) where.category = String(category);
    if (priority) where.priority = String(priority);
    if (isPinned !== undefined) where.isPinned = isPinned === 'true';

    if (targetAudience) {
      where.OR = [
        { targetAudience: 'ALL' },
        { targetAudience: String(targetAudience) },
      ];
    }

    if (hostelId) {
      where.OR = [
        ...(where.OR || []),
        { hostelId: null },
        { hostelId: String(hostelId) },
      ];
    }

    const notices = await prisma.notice.findMany({
      where,
      include: {
        hostel: { select: { id: true, name: true } },
        createdBy: { select: { firstName: true, lastName: true, role: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { publishDate: 'desc' }],
    });

    res.json({ success: true, data: notices });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notices', error: error.message });
  }
};

export const createNotice = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category, priority, targetAudience, hostelId, department, attachmentUrl, expiryDate, isPinned } = req.body;

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        category: category || 'GENERAL',
        priority: priority || 'NORMAL',
        targetAudience: targetAudience || 'ALL',
        hostelId: hostelId || null,
        department: department || null,
        attachmentUrl: attachmentUrl || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isPinned: isPinned || false,
        createdById: req.user?.userId || null,
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'CREATE',
      module: 'NOTICES',
      recordId: notice.id,
      details: `Published notice "${title}" to audience ${notice.targetAudience}`,
    });

    res.status(201).json({ success: true, message: 'Notice published successfully', data: notice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create notice', error: error.message });
  }
};

export const deleteNotice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notice.delete({ where: { id } });
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete notice', error: error.message });
  }
};

// ---------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({ success: true, unreadCount, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update notification', error: error.message });
  }
};
