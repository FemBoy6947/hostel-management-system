import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createAuditLog } from '../utils/audit';

// ---------------------------------------------------------
// USERS MANAGEMENT
// ---------------------------------------------------------

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, isActive, search, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (role) where.role = String(role);
    if (isActive !== undefined) where.isActive = isActive === 'true';

    if (search) {
      where.OR = [
        { firstName: { contains: String(search) } },
        { lastName: { contains: String(search) } },
        { email: { contains: String(search) } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          avatar: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || 'Password@123', 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || 'STUDENT',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'CREATE',
      module: 'USERS',
      recordId: user.id,
      details: `Created user ${user.email} with role ${user.role}`,
    });

    res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, role, firstName, lastName, phone } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        role: role || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone !== undefined ? phone : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'UPDATE',
      module: 'USERS',
      recordId: id,
      details: `Updated user profile/status for ${updated.email}`,
    });

    res.json({ success: true, message: 'User updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
};

// ---------------------------------------------------------
// AUDIT LOGS
// ---------------------------------------------------------

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { module, action, search, page = 1, limit = 15 } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 15;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (module) where.module = String(module);
    if (action) where.action = String(action);

    if (search) {
      where.OR = [
        { userEmail: { contains: String(search) } },
        { action: { contains: String(search) } },
        { module: { contains: String(search) } },
        { details: { contains: String(search) } },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: error.message });
  }
};
