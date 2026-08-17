import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Visitor, Student } from '../types';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Plus, LogOut, ShieldCheck, Loader2 } from 'lucide-react';

export const VisitorsPage: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Register Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    visitorName: '',
    phone: '',
    email: '',
    idProofType: 'AADHAAR',
    idProofNumber: '',
    studentId: '',
    relation: 'PARENT',
    purpose: 'Family visit and delivering care package',
    remarks: '',
  });

  const { success, error } = useToast();
  const { hasRole, user } = useAuth();

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;
      if (user?.role === 'STUDENT' && user.student) params.studentId = user.student.id;

      const [vRes, sRes] = await Promise.all([
        api.get('/visitors', { params }),
        api.get('/students', { params: { limit: 100 } }),
      ]);

      if (vRes.data.success) setVisitors(vRes.data.data);
      if (sRes.data.success) {
        setStudents(sRes.data.data);
        if (sRes.data.data.length > 0 && !formData.studentId) {
          setFormData((prev) => ({ ...prev, studentId: sRes.data.data[0].id }));
        }
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch visitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [selectedStatus, search]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.visitorName) {
      error('Please fill required visitor details');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/visitors/register', formData);
      if (res.data.success) {
        success('Visitor registered and checked in successfully!');
        setIsModalOpen(false);
        fetchVisitors();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to register visitor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (id: string, name: string) => {
    try {
      const res = await api.put(`/visitors/${id}/checkout`);
      if (res.data.success) {
        success(`Visitor ${name} checked out successfully`);
        fetchVisitors();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to check out visitor');
    }
  };

  const columns = [
    {
      header: 'Visitor Information',
      render: (v: Visitor) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{v.visitorName}</p>
          <span className="text-[11px] text-brand-600 font-semibold">{v.relation}</span>
        </div>
      ),
    },
    {
      header: 'Scholar Visited',
      render: (v: Visitor) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">
            {v.student?.user?.firstName} {v.student?.user?.lastName}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">{v.student?.enrollmentNo}</span>
        </div>
      ),
    },
    {
      header: 'ID Verification',
      render: (v: Visitor) => (
        <div className="text-xs">
          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold">
            {v.idProofType}: {v.idProofNumber}
          </span>
        </div>
      ),
    },
    {
      header: 'Check-In / Out',
      render: (v: Visitor) => (
        <div className="text-xs text-slate-600">
          <p>In: {new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          {v.checkOutTime ? (
            <p className="text-slate-400">Out: {new Date(v.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          ) : (
            <span className="text-emerald-600 font-bold">Currently Inside</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (v: Visitor) => (
        <Badge variant={v.status === 'INSIDE' ? 'warning' : 'neutral'}>
          {v.status}
        </Badge>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (v: Visitor) => {
        if (!hasRole(['SUPER_ADMIN', 'ADMIN', 'SECURITY', 'WARDEN'])) return null;
        if (v.status !== 'INSIDE') return <span className="text-xs text-slate-400">Exited</span>;

        return (
          <button
            onClick={() => handleCheckOut(v.id, v.visitorName)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Check Out
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Visitor Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Campus security entry log, visitor identity verification, and checkout records
          </p>
        </div>

        {hasRole(['SUPER_ADMIN', 'ADMIN', 'SECURITY', 'WARDEN']) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Log New Visitor
          </button>
        )}
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
            <option value="INSIDE">INSIDE CAMPUS</option>
            <option value="CHECKED_OUT">CHECKED OUT</option>
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
        data={visitors}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search visitors by name, id proof, student name..."
      />

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Security Desk Visitor Check-In">
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Scholar Being Visited *</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Select Scholar</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user.firstName} {s.user.lastName} ({s.enrollmentNo}) - {s.course}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Visitor Full Name *</label>
              <input
                type="text"
                required
                value={formData.visitorName}
                onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Visitor Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ID Proof Type *</label>
              <select
                value={formData.idProofType}
                onChange={(e) => setFormData({ ...formData, idProofType: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="AADHAAR">Aadhaar Card</option>
                <option value="DRIVING_LICENSE">Driving License</option>
                <option value="PAN">PAN Card</option>
                <option value="PASSPORT">Passport</option>
                <option value="VOTER_ID">Voter ID</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ID Proof Number *</label>
              <input
                type="text"
                required
                placeholder="XXXX-XXXX-XXXX"
                value={formData.idProofNumber}
                onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Relationship to Scholar</label>
              <input
                type="text"
                placeholder="Father, Mother, Brother, etc."
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Purpose of Visit</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In & Issue Gate Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
