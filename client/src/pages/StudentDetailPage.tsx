import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Student } from '../types';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Badge } from '../components/Badge';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building2,
  CreditCard,
  CalendarCheck2,
  QrCode,
  AlertCircle,
  UserPlus,
  Shield,
  Clock,
} from 'lucide-react';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'fees' | 'attendance' | 'passes' | 'complaints'>('overview');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/students/${id}`);
        if (res.data.success) {
          setStudent(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch student profile', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudent();
  }, [id]);

  if (loading || !student) {
    return <SkeletonLoader rows={6} />;
  }

  const activeAlloc = student.allocations?.find((a: any) => a.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center gap-4">
        <Link
          to="/students"
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Profile</h2>
          <p className="text-xs text-slate-500 font-mono">ID: {student.enrollmentNo}</p>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={student.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.enrollmentNo}`}
            alt={student.user?.firstName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-100 bg-slate-100 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-extrabold text-slate-900">
                {student.user?.firstName} {student.user?.lastName}
              </h3>
              <Badge variant={student.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {student.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {student.course} in {student.department} • Year {student.year} (Semester {student.semester})
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-3">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {student.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {student.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" /> Blood Group: <strong>{student.bloodGroup || 'O+'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Current Allocation Pill */}
        <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 min-w-[200px] text-xs">
          <span className="text-brand-800 font-bold uppercase tracking-wider text-[10px]">Hostel Residence</span>
          {activeAlloc ? (
            <div className="mt-1">
              <p className="font-extrabold text-slate-900 text-sm">{activeAlloc.hostel?.name}</p>
              <p className="text-slate-600">Room {activeAlloc.room?.roomNumber} • Bed {activeAlloc.bed?.bedNumber}</p>
            </div>
          ) : (
            <p className="text-slate-400 italic mt-1">No Active Room Assigned</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold text-slate-500 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Residence & Guardians' },
          { id: 'fees', label: 'Fees & Payments' },
          { id: 'attendance', label: 'Attendance History' },
          { id: 'passes', label: 'Leaves & Gate Passes' },
          { id: 'complaints', label: 'Tickets & Complaints' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Academic & Personal Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400">Enrollment Number</span>
                <p className="font-bold text-slate-800 text-sm">{student.enrollmentNo}</p>
              </div>
              <div>
                <span className="text-slate-400">Roll Number</span>
                <p className="font-bold text-slate-800 text-sm">{student.rollNo || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400">Gender</span>
                <p className="font-bold text-slate-800 text-sm">{student.gender}</p>
              </div>
              <div>
                <span className="text-slate-400">Emergency Phone</span>
                <p className="font-bold text-slate-800 text-sm">{student.emergencyContact || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Permanent Home Address</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{student.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Guardians & Emergency Contacts</h4>
            {student.guardians && student.guardians.length > 0 ? (
              student.guardians.map((sg: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 text-sm">{sg.guardian.name}</p>
                    <Badge variant="primary">{sg.guardian.relation}</Badge>
                  </div>
                  <p className="text-slate-600">Phone: {sg.guardian.phone}</p>
                  <p className="text-slate-400 text-[11px]">{sg.guardian.email || 'No email registered'}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic">No guardians linked.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Fees */}
      {activeTab === 'fees' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h4 className="font-bold text-slate-900 text-sm">Invoiced Fee Packages & Payment Records</h4>
          <div className="space-y-4">
            {student.fees?.map((fee: any) => (
              <div key={fee.id} className="p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{fee.feeStructure?.name}</span>
                  <Badge variant={fee.status === 'PAID' ? 'success' : fee.status === 'PARTIALLY_PAID' ? 'warning' : 'danger'}>
                    {fee.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400">Total Invoice</span>
                    <p className="font-extrabold text-slate-900">₹{fee.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-emerald-600 font-semibold">Amount Paid</span>
                    <p className="font-extrabold text-emerald-700">₹{fee.paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-amber-600 font-semibold">Balance Due</span>
                    <p className="font-extrabold text-amber-700">₹{fee.balanceAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Attendance */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
          <h4 className="font-bold text-slate-900 text-sm">Last 30 Days Attendance Logs</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Check-in Time</th>
                  <th className="pb-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {student.attendance?.map((att: any) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold">{new Date(att.date).toLocaleDateString()}</td>
                    <td className="py-2.5">
                      <Badge variant={att.status === 'PRESENT' ? 'success' : att.status === 'LATE' ? 'warning' : 'danger'}>
                        {att.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-slate-500 font-mono">
                      {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="py-2.5 text-slate-400">{att.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Passes */}
      {activeTab === 'passes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Leave Applications</h4>
            <div className="space-y-3">
              {student.leaveRequests?.map((l: any) => (
                <div key={l.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{l.leaveType}</span>
                    <Badge variant={l.status === 'APPROVED' ? 'success' : l.status === 'PENDING' ? 'warning' : 'danger'}>
                      {l.status}
                    </Badge>
                  </div>
                  <p className="text-slate-600">{l.reason}</p>
                  <p className="text-slate-400 text-[11px]">
                    {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Gate Passes</h4>
            <div className="space-y-3">
              {student.gatePasses?.map((gp: any) => (
                <div key={gp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{gp.passNumber}</span>
                    <Badge variant={gp.status === 'APPROVED' || gp.status === 'ACTIVE' ? 'success' : 'neutral'}>
                      {gp.status}
                    </Badge>
                  </div>
                  <p className="text-slate-600">{gp.purpose} → {gp.destination}</p>
                  <p className="text-slate-400 text-[11px]">
                    Departure: {gp.departureTime} | Return: {gp.expectedReturnTime}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Complaints */}
      {activeTab === 'complaints' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
          <h4 className="font-bold text-slate-900 text-sm">Registered Complaints & Resolution History</h4>
          <div className="space-y-3">
            {student.complaints?.map((c: any) => (
              <div key={c.id} className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{c.ticketNo} - {c.title}</span>
                  <Badge variant={c.status === 'RESOLVED' ? 'success' : 'warning'}>
                    {c.status}
                  </Badge>
                </div>
                <p className="text-slate-600">{c.description}</p>
                {c.staffRemarks && (
                  <p className="text-brand-700 bg-brand-50 p-2 rounded-lg font-medium">
                    Staff Resolution: {c.staffRemarks}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
