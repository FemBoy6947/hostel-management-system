import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getOccupancyReport = async (req: Request, res: Response) => {
  try {
    const hostels = await prisma.hostel.findMany({
      include: {
        rooms: {
          include: {
            beds: {
              include: {
                allocations: {
                  where: { status: 'ACTIVE' },
                  include: {
                    student: {
                      include: { user: { select: { firstName: true, lastName: true, email: true } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const reportData = hostels.map((h) => {
      const totalRooms = h.rooms.length;
      let totalBeds = 0;
      let occupiedBeds = 0;
      let availableBeds = 0;
      let maintenanceBeds = 0;

      h.rooms.forEach((r) => {
        totalBeds += r.beds.length;
        r.beds.forEach((b) => {
          if (b.status === 'OCCUPIED') occupiedBeds++;
          else if (b.status === 'MAINTENANCE') maintenanceBeds++;
          else availableBeds++;
        });
      });

      return {
        hostelId: h.id,
        hostelName: h.name,
        code: h.code,
        type: h.type,
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        maintenanceBeds,
        occupancyRate: totalBeds > 0 ? `${Math.round((occupiedBeds / totalBeds) * 100)}%` : '0%',
      };
    });

    res.json({ success: true, data: reportData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate occupancy report', error: error.message });
  }
};

export const getFinancialReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const wherePayment: any = { status: 'COMPLETED' };

    if (startDate && endDate) {
      wherePayment.paymentDate = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate)),
      };
    }

    const [payments, studentFees] = await Promise.all([
      prisma.payment.findMany({
        where: wherePayment,
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
          studentFee: { include: { feeStructure: true } },
        },
        orderBy: { paymentDate: 'desc' },
      }),
      prisma.studentFee.findMany(),
    ]);

    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalInvoiced = studentFees.reduce((sum, f) => sum + f.totalAmount, 0);
    const totalPending = studentFees.reduce((sum, f) => sum + f.balanceAmount, 0);

    const paymentMethodStats = {
      UPI: payments.filter((p) => p.paymentMethod === 'UPI').reduce((sum, p) => sum + p.amount, 0),
      CASH: payments.filter((p) => p.paymentMethod === 'CASH').reduce((sum, p) => sum + p.amount, 0),
      CARD: payments.filter((p) => p.paymentMethod === 'CARD').reduce((sum, p) => sum + p.amount, 0),
      BANK_TRANSFER: payments.filter((p) => p.paymentMethod === 'BANK_TRANSFER').reduce((sum, p) => sum + p.amount, 0),
    };

    res.json({
      success: true,
      summary: {
        totalInvoiced,
        totalCollected,
        totalPending,
        collectionRate: totalInvoiced > 0 ? `${Math.round((totalCollected / totalInvoiced) * 100)}%` : '0%',
        paymentMethodStats,
      },
      payments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate financial report', error: error.message });
  }
};

export const exportReportCsv = async (req: Request, res: Response) => {
  try {
    const { type } = req.params; // 'students' | 'occupancy' | 'payments' | 'complaints'

    let csvContent = '';

    if (type === 'students') {
      const students = await prisma.student.findMany({
        include: {
          user: true,
          allocations: { where: { status: 'ACTIVE' }, include: { hostel: true, room: true, bed: true } },
        },
      });

      const headers = ['Enrollment No', 'First Name', 'Last Name', 'Email', 'Phone', 'Course', 'Department', 'Year', 'Hostel', 'Room', 'Bed', 'Status'];
      const rows = students.map((s) => {
        const alloc = s.allocations[0];
        return [
          s.enrollmentNo,
          s.user.firstName,
          s.user.lastName,
          s.user.email,
          s.phone,
          s.course,
          s.department,
          s.year,
          alloc?.hostel?.name || 'Unassigned',
          alloc?.room?.roomNumber || 'N/A',
          alloc?.bed?.bedNumber || 'N/A',
          s.status,
        ];
      });

      csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell || ''}"`).join(','))].join('\n');
    } else if (type === 'payments') {
      const payments = await prisma.payment.findMany({
        include: {
          student: { include: { user: true } },
          studentFee: { include: { feeStructure: true } },
        },
        orderBy: { paymentDate: 'desc' },
      });

      const headers = ['Receipt No', 'Student Name', 'Enrollment No', 'Fee Type', 'Amount (INR)', 'Payment Method', 'Date', 'Transaction Ref', 'Status'];
      const rows = payments.map((p) => [
        p.invoiceNo,
        `${p.student.user.firstName} ${p.student.user.lastName}`,
        p.student.enrollmentNo,
        p.studentFee.feeStructure.name,
        p.amount,
        p.paymentMethod,
        new Date(p.paymentDate).toISOString().split('T')[0],
        p.transactionRef || '',
        p.status,
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell || ''}"`).join(','))].join('\n');
    } else {
      csvContent = 'Type,Message\nInfo,Invalid report export type specified';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=hms_${type}_report_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to export CSV report', error: error.message });
  }
};
