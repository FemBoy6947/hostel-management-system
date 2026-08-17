import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { GatePass } from '../types';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { QrCode, Plus, CheckCircle, LogOut, LogIn, Loader2 } from 'lucide-react';
import { MOCK_GATE_PASSES } from '../services/mockData';

export const GatePassesPage: React.FC = () => {
  const [gatePasses, setGatePasses] = useState<GatePass[]>(MOCK_GATE_PASSES);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    purpose: 'Market Tech Component Purchase',
    destination: 'City Center Mall',
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '18:00',
    expectedReturnDate: new Date().toISOString().split('T')[0],
    expectedReturnTime: '21:30',
    remarks: 'Routine evening outing',
  });

  const { success, error } = useToast();
  const { hasRole, user } = useAuth();

  const fetchGatePasses = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;
      if (user?.role === 'STUDENT' && user.student) params.studentId = user.student.id;

      const res = await api.get('/gate-passes', { params });
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        setGatePasses(res.data.data);
      } else {
        setGatePasses(MOCK_GATE_PASSES);
      }
    } catch (err: any) {
      setGatePasses(MOCK_GATE_PASSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGatePasses();
  }, [selectedStatus, search]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/gate-passes/apply', formData);
      if (res.data.success) {
        success('Gate pass requested successfully!');
        setIsModalOpen(false);
        fetchGatePasses();
      }
    } catch (err: any) {
      const newPass: GatePass = {
        id: `gp-${Date.now()}`,
        passNumber: `GP-2026-${Math.floor(100 + Math.random() * 900)}`,
        studentId: 'stud-01',
        student: MOCK_GATE_PASSES[0].student,
        destination: formData.destination,
        purpose: formData.purpose,
        departureDate: formData.departureDate,
        departureTime: formData.departureTime,
        expectedReturnDate: formData.expectedReturnDate,
        expectedReturnTime: formData.expectedReturnTime,
        status: 'REQUESTED',
        qrCode: `GP-QR-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString(),
      };
      setGatePasses([newPass, ...gatePasses]);
      success('Gate pass requested (Preview Mode)!');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setGatePasses(gatePasses.map(g => g.id === id ? { ...g, status: status as any } : g));
    success(`Gate pass updated to ${status}`);
  };

  const columns = [
    {
      header: 'Pass ID & QR',
      render: (gp: GatePass) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-xs font-mono">{gp.passNumber}</p>
            <span className="text-[10px] text-brand-600 font-bold uppercase">{gp.qrCode}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Resident Scholar',
      render: (gp: GatePass) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">
            {gp.student?.user?.firstName} {gp.student?.user?.lastName}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">{gp.student?.enrollmentNo}</span>
        </div>
      ),
    },
    {
      header: 'Destination & Purpose',
      render: (gp: GatePass) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{gp.destination}</p>
          <p className="text-slate-400 text-[11px] truncate max-w-xs">{gp.purpose}</p>
        </div>
      ),
    },
    {
      header: 'Time Window',
      render: (gp: GatePass) => (
        <div className="text-xs text-slate-600 font-medium">
          <p>Out: {gp.departureTime} ({new Date(gp.departureDate).toLocaleDateString()})</p>
          <p className="text-amber-600 font-bold">Return: {gp.expectedReturnTime}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (gp: GatePass) => (
        <Badge
          variant={
            gp.status === 'APPROVED' || gp.status === 'RETURNED'
              ? 'success'
              : gp.status === 'ACTIVE'
              ? 'warning'
              : gp.status === 'REQUESTED'
              ? 'info'
              : 'danger'
          }
        >
          {gp.status}
        </Badge>
      ),
    },
    {
      header: 'Security / Warden Action',
      className: 'text-right',
      render: (gp: GatePass) => {
        if (gp.status === 'REQUESTED' && hasRole(['SUPER_ADMIN', 'ADMIN', 'WARDEN'])) {
          return (
            <button
              onClick={() => handleUpdateStatus(gp.id, 'APPROVED')}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
            >
              Approve Pass
            </button>
          );
        }

        if (gp.status === 'APPROVED' && hasRole(['SUPER_ADMIN', 'ADMIN', 'SECURITY'])) {
          return (
            <button
              onClick={() => handleUpdateStatus(gp.id, 'ACTIVE')}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
            >
              <LogOut className="w-3.5 h-3.5" /> Check Out
            </button>
          );
        }

        if (gp.status === 'ACTIVE' && hasRole(['SUPER_ADMIN', 'ADMIN', 'SECURITY'])) {
          return (
            <button
              onClick={() => handleUpdateStatus(gp.id, 'RETURNED')}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
            >
              <LogIn className="w-3.5 h-3.5" /> Check In
            </button>
          );
        }

        return <span className="text-xs text-slate-400">Completed</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Digital Gate Passes</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Student outing permits, automated security desk check-outs, and curfew return tracking
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Apply for Gate Pass
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Pass Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="REQUESTED">REQUESTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="ACTIVE">ACTIVE (Outside Campus)</option>
            <option value="RETURNED">RETURNED</option>
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
        data={gatePasses}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search passes by number, student name, destination..."
      />

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for Digital Gate Pass">
        <form onSubmit={handleApply} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Destination *</label>
            <input
              type="text"
              required
              placeholder="e.g. City Library, Railway Station"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Purpose of Visit *</label>
            <input
              type="text"
              required
              placeholder="e.g. Purchase project components"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Outing Date *</label>
              <input
                type="date"
                required
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value, expectedReturnDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Leaving Time *</label>
              <input
                type="time"
                required
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Expected Return Time *</label>
            <input
              type="time"
              required
              value={formData.expectedReturnTime}
              onChange={(e) => setFormData({ ...formData, expectedReturnTime: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Pass'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
