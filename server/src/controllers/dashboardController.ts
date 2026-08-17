import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role || 'ADMIN';
    const userId = req.user?.userId;

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // Global counters
    const [
      totalStudents,
      totalHostels,
      totalRooms,
      totalBeds,
      occupiedBeds,
      pendingComplaints,
      activeVisitors,
      todayAttendanceCount,
      activeGatePasses,
      allStudentFees,
      allPayments,
      hostelsList,
      roomsList,
      recentPayments,
      recentComplaints,
      recentVisitors,
      recentRegistrations,
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.hostel.count({ where: { status: 'ACTIVE' } }),
      prisma.room.count(),
      prisma.bed.count(),
      prisma.bed.count({ where: { status: 'OCCUPIED' } }),
      prisma.complaint.count({ where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } } }),
      prisma.visitor.count({ where: { status: 'INSIDE' } }),
      prisma.attendance.count({ where: { date: { gte: startOfToday, lte: endOfToday }, status: 'PRESENT' } }),
      prisma.gatePass.count({ where: { status: 'ACTIVE' } }),
      prisma.studentFee.findMany({ select: { totalAmount: true, paidAmount: true, balanceAmount: true, status: true } }),
      prisma.payment.findMany({ select: { amount: true, paymentDate: true, paymentMethod: true } }),
      prisma.hostel.findMany({
        include: {
          _count: { select: { rooms: true } },
          rooms: { select: { capacity: true, currentOccupancy: true } },
        },
      }),
      prisma.room.findMany({ select: { status: true } }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { paymentDate: 'desc' },
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
          studentFee: { include: { feeStructure: { select: { name: true } } } },
        },
      }),
      prisma.complaint.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
          hostel: { select: { name: true } },
        },
      }),
      prisma.visitor.findMany({
        take: 5,
        orderBy: { checkInTime: 'desc' },
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      prisma.student.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true, avatar: true } },
          allocations: { where: { status: 'ACTIVE' }, include: { hostel: true, room: true } },
        },
      }),
    ]);

    const availableBeds = totalBeds - occupiedBeds;
    const totalCollectedFees = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPendingFees = allStudentFees.reduce((sum, f) => sum + f.balanceAmount, 0);

    // Monthly revenue chart aggregation (Last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenueMap: { [key: string]: number } = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyRevenueMap[key] = 0;
    }

    allPayments.forEach((p) => {
      const d = new Date(p.paymentDate);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyRevenueMap[key] !== undefined) {
        monthlyRevenueMap[key] += p.amount;
      }
    });

    const monthlyRevenueChart = Object.keys(monthlyRevenueMap).map((name) => ({
      name,
      revenue: monthlyRevenueMap[name],
    }));

    // Hostel occupancy chart data
    const hostelOccupancyChart = hostelsList.map((h) => {
      const totalCapacity = h.rooms.reduce((sum, r) => sum + r.capacity, 0);
      const occupied = h.rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
      return {
        name: h.name,
        capacity: totalCapacity,
        occupied,
        available: Math.max(0, totalCapacity - occupied),
        occupancyRate: totalCapacity > 0 ? Math.round((occupied / totalCapacity) * 100) : 0,
      };
    });

    // Room status breakdown chart data
    const roomStatusCounts = {
      AVAILABLE: roomsList.filter((r) => r.status === 'AVAILABLE').length,
      PARTIALLY_OCCUPIED: roomsList.filter((r) => r.status === 'PARTIALLY_OCCUPIED').length,
      FULL: roomsList.filter((r) => r.status === 'FULL').length,
      MAINTENANCE: roomsList.filter((r) => r.status === 'MAINTENANCE').length,
    };

    // If role is Student or Parent, fetch personalized dashboard slice
    let studentSlice = null;
    if (role === 'STUDENT' && userId) {
      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          user: { select: { firstName: true, lastName: true, email: true, avatar: true } },
          allocations: {
            where: { status: 'ACTIVE' },
            include: {
              hostel: { include: { warden: { select: { firstName: true, lastName: true, phone: true } } } },
              floor: true,
              room: {
                include: {
                  beds: {
                    include: {
                      allocations: {
                        where: { status: 'ACTIVE' },
                        include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
                      },
                    },
                  },
                },
              },
              bed: true,
            },
          },
          fees: { include: { feeStructure: true } },
          leaveRequests: { take: 3, orderBy: { createdAt: 'desc' } },
          gatePasses: { take: 3, orderBy: { createdAt: 'desc' } },
          complaints: { take: 3, orderBy: { createdAt: 'desc' } },
        },
      });

      const todayAttendance = await prisma.attendance.findFirst({
        where: { studentId: student?.id, date: { gte: startOfToday, lte: endOfToday } },
      });

      studentSlice = {
        student,
        todayAttendance,
      };
    }

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalHostels,
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyPercentage: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        totalCollectedFees,
        totalPendingFees,
        pendingComplaints,
        activeVisitors,
        todayAttendanceCount,
        activeGatePasses,
      },
      charts: {
        monthlyRevenue: monthlyRevenueChart,
        hostelOccupancy: hostelOccupancyChart,
        roomStatus: [
          { name: 'Available', value: roomStatusCounts.AVAILABLE, color: '#10B981' },
          { name: 'Partially Occupied', value: roomStatusCounts.PARTIALLY_OCCUPIED, color: '#F59E0B' },
          { name: 'Full', value: roomStatusCounts.FULL, color: '#EF4444' },
          { name: 'Maintenance', value: roomStatusCounts.MAINTENANCE, color: '#6B7280' },
        ],
      },
      recent: {
        payments: recentPayments,
        complaints: recentComplaints,
        visitors: recentVisitors,
        registrations: recentRegistrations,
      },
      studentSlice,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: error.message });
  }
};
