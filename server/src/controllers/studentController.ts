import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createAuditLog } from '../utils/audit';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const {
      search,
      department,
      course,
      year,
      status,
      hostelId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};

    if (search) {
      where.OR = [
        { enrollmentNo: { contains: String(search) } },
        { user: { firstName: { contains: String(search) } } },
        { user: { lastName: { contains: String(search) } } },
        { user: { email: { contains: String(search) } } },
        { phone: { contains: String(search) } },
      ];
    }

    if (department) where.department = String(department);
    if (course) where.course = String(course);
    if (year) where.year = parseInt(String(year));
    if (status) where.status = String(status);

    if (hostelId) {
      where.allocations = {
        some: {
          hostelId: String(hostelId),
          status: 'ACTIVE',
        },
      };
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { [String(sortBy)]: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true, isActive: true },
          },
          allocations: {
            where: { status: 'ACTIVE' },
            include: { hostel: true, floor: true, room: true, bed: true },
          },
          guardians: {
            include: { guardian: true },
          },
          fees: {
            select: { totalAmount: true, paidAmount: true, balanceAmount: true, status: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, isActive: true } },
        allocations: {
          include: { hostel: true, floor: true, room: true, bed: true, allocatedBy: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        guardians: { include: { guardian: true } },
        fees: {
          include: { feeStructure: true, payments: { orderBy: { paymentDate: 'desc' } } },
          orderBy: { createdAt: 'desc' },
        },
        payments: { orderBy: { paymentDate: 'desc' } },
        attendance: { orderBy: { date: 'desc' }, take: 30 },
        leaveRequests: { orderBy: { createdAt: 'desc' } },
        gatePasses: { orderBy: { createdAt: 'desc' } },
        complaints: { orderBy: { createdAt: 'desc' } },
        visitors: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch student details', error: error.message });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dob,
      enrollmentNo,
      rollNo,
      course,
      department,
      year,
      semester,
      address,
      bloodGroup,
      emergencyContact,
      guardianName,
      guardianRelation,
      guardianPhone,
      guardianEmail,
    } = req.body;

    // Check if email or enrollment already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const existingStudent = await prisma.student.findUnique({ where: { enrollmentNo } });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Student with this enrollment number already exists' });
    }

    const hashedPassword = await bcrypt.hash('Student@123', 10);

    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: 'STUDENT',
          isActive: true,
        },
      });

      // Create Student
      const student = await tx.student.create({
        data: {
          userId: user.id,
          enrollmentNo,
          rollNo,
          dob: dob ? new Date(dob) : null,
          gender: gender || 'MALE',
          phone,
          email: email.toLowerCase(),
          address,
          course: course || 'B.Tech',
          department: department || 'CSE',
          year: year ? parseInt(year) : 1,
          semester: semester ? parseInt(semester) : 1,
          emergencyContact,
          bloodGroup,
          status: 'ACTIVE',
        },
      });

      // Create Guardian if provided
      if (guardianName && guardianPhone) {
        const guardian = await tx.guardian.create({
          data: {
            name: guardianName,
            relation: guardianRelation || 'FATHER',
            phone: guardianPhone,
            email: guardianEmail || null,
          },
        });

        await tx.studentGuardian.create({
          data: {
            studentId: student.id,
            guardianId: guardian.id,
            isPrimary: true,
          },
        });
      }

      return student;
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'CREATE',
      module: 'STUDENTS',
      recordId: result.id,
      details: `Created student ${firstName} ${lastName} (${enrollmentNo})`,
    });

    res.status(201).json({ success: true, message: 'Student registered successfully', data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create student', error: error.message });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      gender,
      dob,
      course,
      department,
      year,
      semester,
      address,
      bloodGroup,
      emergencyContact,
      status,
    } = req.body;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (firstName || lastName) {
        await tx.user.update({
          where: { id: student.userId },
          data: {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phone: phone || undefined,
          },
        });
      }

      return await tx.student.update({
        where: { id },
        data: {
          phone: phone || undefined,
          gender: gender || undefined,
          dob: dob ? new Date(dob) : undefined,
          course: course || undefined,
          department: department || undefined,
          year: year ? parseInt(year) : undefined,
          semester: semester ? parseInt(semester) : undefined,
          address: address !== undefined ? address : undefined,
          bloodGroup: bloodGroup !== undefined ? bloodGroup : undefined,
          emergencyContact: emergencyContact !== undefined ? emergencyContact : undefined,
          status: status || undefined,
        },
      });
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'UPDATE',
      module: 'STUDENTS',
      recordId: id,
      details: `Updated student details for ID: ${id}`,
    });

    res.json({ success: true, message: 'Student updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update student', error: error.message });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Soft delete: deactivate user and mark student as INACTIVE
    await prisma.$transaction([
      prisma.student.update({
        where: { id },
        data: { status: 'INACTIVE' },
      }),
      prisma.user.update({
        where: { id: student.userId },
        data: { isActive: false },
      }),
    ]);

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'DELETE',
      module: 'STUDENTS',
      recordId: id,
      details: `Deactivated student ID: ${id}`,
    });

    res.json({ success: true, message: 'Student deactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to deactivate student', error: error.message });
  }
};
