import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createAuditLog } from '../utils/audit';

// ---------------------------------------------------------
// FEE STRUCTURES
// ---------------------------------------------------------

export const getFeeStructures = async (req: Request, res: Response) => {
  try {
    const { hostelId } = req.query;
    const where: any = {};
    if (hostelId) where.hostelId = String(hostelId);

    const feeStructures = await prisma.feeStructure.findMany({
      where,
      include: {
        hostel: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: feeStructures });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch fee structures', error: error.message });
  }
};

export const createFeeStructure = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      hostelId,
      roomType,
      academicYear,
      semester,
      hostelFee,
      messFee,
      maintenanceFee,
      securityDeposit,
      otherCharges,
      lateFeePerDay,
      dueDate,
    } = req.body;

    const feeStructure = await prisma.feeStructure.create({
      data: {
        name,
        hostelId,
        roomType: roomType || 'DOUBLE',
        academicYear: academicYear || '2025-2026',
        semester: semester ? parseInt(semester) : 1,
        hostelFee: parseFloat(hostelFee) || 30000,
        messFee: parseFloat(messFee) || 20000,
        maintenanceFee: parseFloat(maintenanceFee) || 3000,
        securityDeposit: parseFloat(securityDeposit) || 5000,
        otherCharges: parseFloat(otherCharges) || 1000,
        lateFeePerDay: parseFloat(lateFeePerDay) || 50,
        dueDate: new Date(dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'CREATE',
      module: 'FEES',
      recordId: feeStructure.id,
      details: `Created fee structure ${name}`,
    });

    res.status(201).json({ success: true, message: 'Fee structure created successfully', data: feeStructure });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create fee structure', error: error.message });
  }
};

// ---------------------------------------------------------
// STUDENT FEES
// ---------------------------------------------------------

export const getStudentFees = async (req: Request, res: Response) => {
  try {
    const { status, studentId, hostelId, search, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (status) where.status = String(status);
    if (studentId) where.studentId = String(studentId);

    if (hostelId) {
      where.student = {
        allocations: { some: { hostelId: String(hostelId), status: 'ACTIVE' } },
      };
    }

    if (search) {
      where.OR = [
        { student: { enrollmentNo: { contains: String(search) } } },
        { student: { user: { firstName: { contains: String(search) } } } },
        { student: { user: { lastName: { contains: String(search) } } } },
      ];
    }

    const [total, fees] = await Promise.all([
      prisma.studentFee.count({ where }),
      prisma.studentFee.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { dueDate: 'asc' },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true, phone: true } },
              allocations: {
                where: { status: 'ACTIVE' },
                include: { hostel: true, room: true },
              },
            },
          },
          feeStructure: true,
          payments: { orderBy: { paymentDate: 'desc' } },
        },
      }),
    ]);

    // Check overdue dynamically
    const now = new Date();
    const checkedFees = fees.map((f) => {
      let currentStatus = f.status;
      if (f.status !== 'PAID' && new Date(f.dueDate) < now) {
        currentStatus = 'OVERDUE';
      }
      return { ...f, status: currentStatus };
    });

    res.json({
      success: true,
      data: checkedFees,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch student fees', error: error.message });
  }
};

export const assignFeeToStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, feeStructureId, discountAmount = 0, dueDate, remarks } = req.body;

    const feeStructure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } });
    if (!feeStructure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }

    const totalBeforeDiscount =
      feeStructure.hostelFee +
      feeStructure.messFee +
      feeStructure.maintenanceFee +
      feeStructure.securityDeposit +
      feeStructure.otherCharges;

    const discount = parseFloat(discountAmount) || 0;
    const finalAmount = Math.max(0, totalBeforeDiscount - discount);

    const studentFee = await prisma.studentFee.create({
      data: {
        studentId,
        feeStructureId,
        totalAmount: totalBeforeDiscount,
        discountAmount: discount,
        paidAmount: 0,
        balanceAmount: finalAmount,
        dueDate: dueDate ? new Date(dueDate) : feeStructure.dueDate,
        status: 'PENDING',
        remarks,
      },
      include: {
        student: { include: { user: true } },
        feeStructure: true,
      },
    });

    // Send notification
    await prisma.notification.create({
      data: {
        userId: studentFee.student.userId,
        title: 'Fee Invoice Generated',
        message: `New fee invoice of ₹${finalAmount.toLocaleString()} has been assigned. Due on ${new Date(studentFee.dueDate).toLocaleDateString()}.`,
        type: 'WARNING',
        link: '/fees',
      },
    });

    res.status(201).json({ success: true, message: 'Fee assigned to student successfully', data: studentFee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to assign fee', error: error.message });
  }
};

// ---------------------------------------------------------
// PAYMENTS & RECEIPTS
// ---------------------------------------------------------

export const getPayments = async (req: Request, res: Response) => {
  try {
    const { studentId, paymentMethod, status, startDate, endDate, page = 1, limit = 10, search } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (studentId) where.studentId = String(studentId);
    if (paymentMethod) where.paymentMethod = String(paymentMethod);
    if (status) where.status = String(status);

    if (startDate && endDate) {
      where.paymentDate = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate)),
      };
    }

    if (search) {
      where.OR = [
        { invoiceNo: { contains: String(search) } },
        { transactionRef: { contains: String(search) } },
        { student: { enrollmentNo: { contains: String(search) } } },
        { student: { user: { firstName: { contains: String(search) } } } },
        { student: { user: { lastName: { contains: String(search) } } } },
      ];
    }

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { paymentDate: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true, phone: true } },
              allocations: { where: { status: 'ACTIVE' }, include: { hostel: true, room: true } },
            },
          },
          studentFee: { include: { feeStructure: true } },
          receivedBy: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments', error: error.message });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { studentFeeId, amount, paymentMethod, transactionRef, remarks } = req.body;

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    const studentFee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
      include: { student: { include: { user: true } }, feeStructure: true },
    });

    if (!studentFee) {
      return res.status(404).json({ success: false, message: 'Student fee invoice not found' });
    }

    if (payAmount > studentFee.balanceAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (₹${payAmount}) cannot exceed outstanding balance (₹${studentFee.balanceAmount}).`,
      });
    }

    const invoiceNo = `HMS-REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment
      const payment = await tx.payment.create({
        data: {
          invoiceNo,
          studentFeeId,
          studentId: studentFee.studentId,
          amount: payAmount,
          paymentMethod: paymentMethod || 'UPI',
          transactionRef: transactionRef || `TXN-${Date.now()}`,
          paymentDate: new Date(),
          status: 'COMPLETED',
          remarks,
          receivedById: req.user?.userId || null,
        },
        include: {
          student: { include: { user: true } },
          studentFee: { include: { feeStructure: true } },
        },
      });

      // 2. Update Student Fee balance & status
      const newPaid = studentFee.paidAmount + payAmount;
      const newBalance = studentFee.balanceAmount - payAmount;
      const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';

      await tx.studentFee.update({
        where: { id: studentFeeId },
        data: {
          paidAmount: newPaid,
          balanceAmount: newBalance,
          status: newStatus,
        },
      });

      // 3. Notification to student
      await tx.notification.create({
        data: {
          userId: studentFee.student.userId,
          title: 'Payment Received',
          message: `Payment of ₹${payAmount.toLocaleString()} received successfully for ${studentFee.feeStructure.name}. Receipt #${invoiceNo}.`,
          type: 'SUCCESS',
          link: '/payments',
        },
      });

      return payment;
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'PAYMENT',
      module: 'PAYMENTS',
      recordId: result.id,
      details: `Recorded payment of ₹${payAmount} (${invoiceNo}) for student ${studentFee.student.user.firstName}`,
    });

    res.status(201).json({ success: true, message: 'Payment recorded successfully', data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to record payment', error: error.message });
  }
};

export const getPaymentReceipt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
            allocations: {
              where: { status: 'ACTIVE' },
              include: { hostel: true, room: true, bed: true },
            },
          },
        },
        studentFee: { include: { feeStructure: true } },
        receivedBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment receipt not found' });
    }

    res.json({ success: true, data: payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch receipt', error: error.message });
  }
};
