import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LeaveRequest } from '../types';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { CalendarX, Plus, Check, X, Loader2 } from 'lucide-react';

export const LeavesPage: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Apply Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'HOME_VISIT',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyPhone: '',
    parentPhone: '',
  });

  const { success, error } = useToast();
  const { hasRole, user } = useAuth();

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;
      if (user?.role === 'STUDENT' && user.student) params.studentId = user.student.id;

      const res = await api.get('/leaves', { params });
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [selectedStatus, search]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/leaves/apply', formData);
      if (res.data.success) {
        success('Leave request submitted to Warden!');
        setIsModalOpen(false);
        fetchLeaves();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const remarks = window.prompt(`Enter remarks for marking as ${status}:`, status === 'APPROVED' ? 'Approved by Warden' : 'Rejected');
    if (remarks === null) return;

    try {
      const res = await api.put(`/leaves/${id}/status`, { status, wardenRemarks: remarks });
      if (res.data.success) {
        success(`Leave request ${status.toLowerCase()}`);
        fetchLeaves();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  const columns = [
    {
      header: 'Resident Scholar',
      render: (l: LeaveRequest) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">
            {l.student?.user?.firstName} {l.student?.user?.lastName}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">{l.student?.enrollmentNo}</span>
        </div>
      ),
    },
    {
      header: 'Leave Category',
      render: (l: LeaveRequest) => (
        <span className="font-bold text-slate-800 text-xs">{l.leaveType.replace('_', ' ')}</span>
      ),
    },
    {
      header: 'Duration',
      render: (l: LeaveRequest) => (
        <div className="text-xs text-slate-600">
          <p className="font-medium">
            {new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      header: 'Reason',
      render: (l: LeaveRequest) => (
        <p className="text-xs text-slate-600 max-w-xs truncate" title={l.reason}>
          {l.reason}
        </p>
      ),
    },
    {
      header: 'Status',
      render: (l: LeaveRequest) => (
        <Badge
          variant={
            l.status === 'APPROVED' ? 'success' : l.status === 'PENDING' ? 'warning' : 'danger'
          }
        >
          {l.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (l: LeaveRequest) => {
        if (!hasRole(['SUPER_ADMIN', 'ADMIN', 'WARDEN'])) return null;
        if (l.status !== 'PENDING') return <span className="text-xs text-slate-400 italic">Processed</span>;

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleUpdateStatus(l.id, 'APPROVED')}
              title="Approve Leave"
              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleUpdateStatus(l.id, 'REJECTED')}
              title="Reject Leave"
              className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leave Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Night out, home visits, and medical leave request approvals
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Apply for Leave
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedStatus('');
              setSearch('');
            }}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={leaves}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search leaves by student name, reason..."
      />

      {/* Apply Leave Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Leave Request">
        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Leave Category *</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="HOME_VISIT">Home Visit</option>
              <option value="MEDICAL">Medical Emergency</option>
              <option value="ACADEMIC">Academic / Competition</option>
              <option value="EMERGENCY">Family Emergency</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Reason *</label>
            <textarea
              required
              rows={3}
              placeholder="State clear purpose of leave for Warden review..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Emergency Contact</label>
              <input
                type="text"
                placeholder="+91 98XXXXXXXX"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Parent Contact</label>
              <input
                type="text"
                placeholder="+91 98XXXXXXXX"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
