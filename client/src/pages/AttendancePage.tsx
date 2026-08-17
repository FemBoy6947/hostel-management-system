import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Hostel, Attendance } from '../types';
import { Badge } from '../components/Badge';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { CalendarCheck2, CheckCircle2, XCircle, Clock, AlertTriangle, Save, Loader2 } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { success, error } = useToast();
  const { hasRole, user } = useAuth();

  const fetchHostels = async () => {
    try {
      const res = await api.get('/hostels');
      if (res.data.success) {
        setHostels(res.data.data);
        if (res.data.data.length > 0 && !selectedHostel) {
          setSelectedHostel(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedHostel || !selectedDate) return;
    try {
      setLoading(true);
      const res = await api.get('/attendance', {
        params: {
          hostelId: selectedHostel,
          date: selectedDate,
        },
      });
      if (res.data.success) {
        setAttendanceRecords(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedHostel, selectedDate]);

  const handleStatusChange = (studentId: string, newStatus: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );
  };

  const handleMarkAll = (status: string) => {
    setAttendanceRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSaveBulk = async () => {
    setSaving(true);
    try {
      const records = attendanceRecords.map((r) => ({
        studentId: r.studentId,
        status: r.status === 'NOT_MARKED' ? 'PRESENT' : r.status,
        remarks: r.remarks,
      }));

      const res = await api.post('/attendance/mark-bulk', {
        hostelId: selectedHostel,
        date: selectedDate,
        records,
      });

      if (res.data.success) {
        success('Daily attendance saved successfully!');
        fetchAttendance();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const presentCount = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
  const absentCount = attendanceRecords.filter((r) => r.status === 'ABSENT').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'LATE').length;
  const leaveCount = attendanceRecords.filter((r) => r.status === 'LEAVE').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daily Student Attendance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hostel roll-call, nightly check-in logs, and presenteeism tracking
          </p>
        </div>

        {hasRole(['SUPER_ADMIN', 'ADMIN', 'WARDEN']) && (
          <button
            onClick={handleSaveBulk}
            disabled={saving || attendanceRecords.length === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Attendance
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs items-end">
        <div className="sm:col-span-4">
          <label className="block text-slate-500 font-semibold mb-1">Hostel Block</label>
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4">
          <label className="block text-slate-500 font-semibold mb-1">Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium"
          />
        </div>

        {hasRole(['SUPER_ADMIN', 'ADMIN', 'WARDEN']) && (
          <div className="sm:col-span-4 flex items-center gap-2">
            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="flex-1 py-2 px-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl border border-emerald-200 text-xs transition-colors"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              className="flex-1 py-2 px-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl border border-rose-200 text-xs transition-colors"
            >
              All Absent
            </button>
          </div>
        )}
      </div>

      {/* Daily Metrics Pill Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center justify-between">
          <span className="font-semibold">Present</span>
          <span className="text-lg font-extrabold">{presentCount}</span>
        </div>
        <div className="p-3 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 flex items-center justify-between">
          <span className="font-semibold">Absent</span>
          <span className="text-lg font-extrabold">{absentCount}</span>
        </div>
        <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 flex items-center justify-between">
          <span className="font-semibold">Late Entry</span>
          <span className="text-lg font-extrabold">{lateCount}</span>
        </div>
        <div className="p-3 bg-blue-50 text-blue-800 rounded-2xl border border-blue-200 flex items-center justify-between">
          <span className="font-semibold">On Leave</span>
          <span className="text-lg font-extrabold">{leaveCount}</span>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 font-semibold text-slate-500 uppercase">
                <th className="py-3.5 px-4">Resident Scholar</th>
                <th className="py-3.5 px-4">Room & Bed</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No active scholars allocated to this hostel block.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((item) => (
                  <tr key={item.studentId} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.enrollmentNo}`}
                          alt={item.studentName}
                          className="w-7 h-7 rounded-lg object-cover bg-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.studentName}</p>
                          <span className="text-[11px] text-slate-400 font-mono">{item.enrollmentNo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      Room {item.roomNumber} • Bed {item.bedNumber} ({item.floorName})
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          item.status === 'PRESENT'
                            ? 'success'
                            : item.status === 'ABSENT'
                            ? 'danger'
                            : item.status === 'LATE'
                            ? 'warning'
                            : item.status === 'LEAVE'
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {hasRole(['SUPER_ADMIN', 'ADMIN', 'WARDEN']) ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleStatusChange(item.studentId, 'PRESENT')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                              item.status === 'PRESENT'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            P
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.studentId, 'ABSENT')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                              item.status === 'ABSENT'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            A
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.studentId, 'LATE')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                              item.status === 'LATE'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.studentId, 'LEAVE')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                              item.status === 'LEAVE'
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">View Only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
