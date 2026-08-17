import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createAuditLog } from '../utils/audit';

export const getGuardians = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { phone: { contains: String(search) } },
        { email: { contains: String(search) } },
      ];
    }

    const [total, guardians] = await Promise.all([
      prisma.guardian.count({ where }),
      prisma.guardian.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        include: {
          students: {
            include: {
              student: {
                include: {
                  user: { select: { firstName: true, lastName: true, email: true } },
                  allocations: { where: { status: 'ACTIVE' }, include: { hostel: true, room: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: guardians,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch guardians', error: error.message });
  }
};

export const createGuardian = async (req: AuthRequest, res: Response) => {
  try {
    const { name, relation, phone, email, occupation, address, studentId } = req.body;

    const guardian = await prisma.guardian.create({
      data: {
        name,
        relation,
        phone,
        email,
        occupation,
        address,
      },
    });

    if (studentId) {
      await prisma.studentGuardian.create({
        data: {
          guardianId: guardian.id,
          studentId,
          isPrimary: true,
        },
      });
    }

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'CREATE',
      module: 'GUARDIANS',
      recordId: guardian.id,
      details: `Created guardian ${name}`,
    });

    res.status(201).json({ success: true, message: 'Guardian created successfully', data: guardian });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create guardian', error: error.message });
  }
};

export const updateGuardian = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, relation, phone, email, occupation, address } = req.body;

    const updated = await prisma.guardian.update({
      where: { id },
      data: { name, relation, phone, email, occupation, address },
    });

    res.json({ success: true, message: 'Guardian updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update guardian', error: error.message });
  }
};

export const deleteGuardian = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.guardian.delete({ where: { id } });
    res.json({ success: true, message: 'Guardian deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete guardian', error: error.message });
  }
};
