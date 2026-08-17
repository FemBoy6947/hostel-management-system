import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Badge } from '../components/Badge';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  DoorOpen,
  BedDouble,
  CreditCard,
  Receipt,
  AlertCircle,
  UserPlus,
  CalendarCheck2,
  QrCode,
  ArrowRight,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<any>(null);
  const [recent, setRecent] = useState<any>(null);
  const [studentSlice, setStudentSlice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
        setRecent(res.data.recent);
        setStudentSlice(res.data.studentSlice);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.role]);

  if (loading || !stats) {
    return <SkeletonLoader rows={6} type="card" />;
  }

  const role = user?.role || 'STUDENT';

  // ---------------------------------------------------------
  // STUDENT / PARENT DASHBOARD VIEW
  // ---------------------------------------------------------
  if (role === 'STUDENT' || role === 'PARENT') {
    const student = studentSlice?.student;
    const activeAlloc = student?.allocations && student?.allocations[0];
    const room = activeAlloc?.room;
    const roommates = room?.beds
      ?.flatMap((b: any) => b.allocations || [])
      ?.filter((a: any) => a.student?.id !== student?.id);

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
              {role === 'STUDENT' ? 'Student Portal' : 'Parent & Guardian Portal'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              Welcome back, {user?.firstName} {user?.lastName}!
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {role === 'STUDENT'
                ? `Enrollment ID: ${student?.enrollmentNo || 'ENR-2026'} | Course: ${student?.course || 'B.Tech'} (${student?.department || 'CSE'})`
                : `Viewing Academic & Hostel Residence Data for Ward: ${student?.user?.firstName || 'Student'}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/leaves"
              className="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm border border-white/10 transition-colors"
            >
              Apply Leave
            </Link>
            <Link
              to="/gate-passes"
              className="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm border border-white/10 transition-colors"
            >
              Request Gate Pass
            </Link>
            <Link
              to="/complaints"
              className="px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md shadow-brand-600/30 transition-colors"
            >
              Raise Complaint
            </Link>
          </div>
        </div>

        {/* Room & Residence Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Current Allotment</h3>
                  <p className="text-xs text-slate-400">Assigned residential quarters</p>
                </div>
              </div>
              <Badge variant={activeAlloc ? 'success' : 'warning'}>
                {activeAlloc ? 'ACTIVE RESIDENT' : 'NO ALLOCATION'}
              </Badge>
            </div>

            {activeAlloc ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Hostel Name</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{activeAlloc.hostel?.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Room Number</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">Room {activeAlloc.room?.roomNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Bed Assigned</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">Bed {activeAlloc.bed?.bedNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Hostel Warden</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{activeAlloc.hostel?.warden?.firstName || 'Prof. Alok'}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">No active room allotment found. Contact the hostel warden.</p>
            )}

            {/* Roommates */}
            {roommates && roommates.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Roommates</h4>
                <div className="flex flex-wrap gap-2">
                  {roommates.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {r.student?.user?.firstName} {r.student?.user?.lastName}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fee & Attendance Overview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Fee Ledger</h3>
                <Link to="/fees" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                  View All
                </Link>
              </div>

              {student?.fees && student?.fees[0] ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs text-slate-400">Total Invoiced</span>
                    <p className="text-lg font-extrabold text-slate-900">₹{student.fees[0].totalAmount?.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800">
                    <span className="text-xs text-emerald-600">Total Paid</span>
                    <p className="text-lg font-extrabold">₹{student.fees[0].paidAmount?.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-800">
                    <span className="text-xs text-amber-600">Outstanding Balance</span>
                    <p className="text-lg font-extrabold">₹{student.fees[0].balanceAmount?.toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No pending fee records.</p>
              )}
            </div>

            <Link
              to="/payments"
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Payment Receipts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Weekly Mess Menu', path: '/mess', icon: UtensilsCrossed, color: 'text-amber-600 bg-amber-50' },
            { label: 'Attendance Record', path: '/attendance', icon: CalendarCheck2, color: 'text-blue-600 bg-blue-50' },
            { label: 'Leave Applications', path: '/leaves', icon: Clock, color: 'text-purple-600 bg-purple-50' },
            { label: 'Active Gate Passes', path: '/gate-passes', icon: QrCode, color: 'text-emerald-600 bg-emerald-50' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.path}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group"
              >
                <div className={`p-2.5 rounded-xl ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                    {item.label}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // ADMIN / WARDEN / ACCOUNTANT / SECURITY / MESS / STAFF DASHBOARD
  // ---------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {role.replace('_', ' ')} Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time hostel occupancy, financial ledgers, and operational oversight
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/allocations"
            className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
          >
            + Allocate Room
          </Link>
          <Link
            to="/reports"
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
          >
            Export Reports
          </Link>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active Students"
          value={stats.totalStudents}
          icon={Users}
          color="blue"
          trend="12%"
          trendUp={true}
          subtitle="Enrolled residents"
        />
        <StatCard
          title="Bed Occupancy"
          value={`${stats.occupiedBeds} / ${stats.totalBeds}`}
          icon={BedDouble}
          color="emerald"
          trend={`${stats.occupancyPercentage}% Occupied`}
          trendUp={true}
          subtitle={`${stats.availableBeds} beds available`}
        />
        <StatCard
          title="Total Collected Revenue"
          value={`₹${(stats.totalCollectedFees / 100000).toFixed(1)}L`}
          icon={CreditCard}
          color="purple"
          trend="8.4%"
          trendUp={true}
          subtitle={`₹${(stats.totalPendingFees / 100000).toFixed(1)}L pending dues`}
        />
        <StatCard
          title="Active Inside Visitors"
          value={stats.activeVisitors}
          icon={UserPlus}
          color="amber"
          subtitle={`${stats.activeGatePasses} active gate passes`}
        />
      </div>

      {/* KPI Cards Row 2 (Operations) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Hostels Configured"
          value={stats.totalHostels}
          icon={Building2}
          color="slate"
          subtitle={`${stats.totalRooms} total rooms`}
        />
        <StatCard
          title="Today's Present Attendance"
          value={stats.todayAttendanceCount}
          icon={CalendarCheck2}
          color="emerald"
          subtitle="Daily check-ins logged"
        />
        <StatCard
          title="Pending Complaints"
          value={stats.pendingComplaints}
          icon={AlertCircle}
          color="rose"
          subtitle="Requires staff action"
        />
        <StatCard
          title="Active Gate Passes"
          value={stats.activeGatePasses}
          icon={QrCode}
          color="blue"
          subtitle="Currently outside campus"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Fee Collection Trend</h3>
              <p className="text-xs text-slate-400">Total collected semester fees in INR</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% YoY
            </div>
          </div>

          <div className="h-64 w-full">
            {charts?.monthlyRevenue && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Collection']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Room Status Breakdown (Donut Chart) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Room Status Distribution</h3>
            <p className="text-xs text-slate-400">Current availability split</p>
          </div>

          <div className="h-56 w-full">
            {charts?.roomStatus && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.roomStatus}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.roomStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Fee Payments</h3>
            <Link to="/payments" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Receipt</th>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recent?.payments?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-900">{p.invoiceNo}</td>
                    <td className="py-2.5 font-medium">{p.student?.user?.firstName} {p.student?.user?.lastName}</td>
                    <td className="py-2.5 font-bold text-emerald-600">₹{p.amount.toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">{p.paymentMethod}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Complaint Tickets</h3>
            <Link to="/complaints" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Ticket</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Hostel</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recent?.complaints?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-900">{c.ticketNo}</td>
                    <td className="py-2.5 font-medium max-w-[150px] truncate">{c.title}</td>
                    <td className="py-2.5 text-slate-500">{c.hostel?.name || 'Boys Hostel'}</td>
                    <td className="py-2.5">
                      <Badge variant={c.status === 'RESOLVED' ? 'success' : c.status === 'IN_PROGRESS' ? 'warning' : 'danger'}>
                        {c.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
