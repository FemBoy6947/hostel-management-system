import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MaintenanceTask, Hostel } from '../types';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, Plus, CheckCircle, Clock, DollarSign, Loader2 } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    hostelId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    estimatedCost: '1500',
    notes: 'Standard maintenance order',
  });

  const { success, error } = useToast();
  const { hasRole } = useAuth();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;

      const [tRes, hRes] = await Promise.all([
        api.get('/maintenance', { params }),
        api.get('/hostels'),
      ]);

      if (tRes.data.success) {
        setTasks(tRes.data.data);
        setSummary(tRes.data.summary);
      }
      if (hRes.data.success) {
        setHostels(hRes.data.data);
        if (hRes.data.data.length > 0 && !formData.hostelId) {
          setFormData((prev) => ({ ...prev, hostelId: hRes.data.data[0].id }));
        }
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch maintenance tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedStatus, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hostelId || !formData.title) {
      error('Please fill required maintenance task details');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/maintenance', formData);
      if (res.data.success) {
        success('Maintenance task order generated!');
        setIsModalOpen(false);
        fetchTasks();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create maintenance task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const cost = window.prompt('Enter actual cost in INR:', '1200');
    if (cost === null) return;
    try {
      const res = await api.put(`/maintenance/${id}`, { status, actualCost: cost });
      if (res.data.success) {
        success(`Task marked as ${status}`);
        fetchTasks();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const columns = [
    {
      header: 'Task Number',
      render: (t: MaintenanceTask) => (
        <div>
          <p className="font-extrabold text-slate-900 text-xs font-mono">{t.taskNumber}</p>
          <span className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      header: 'Title & Location',
      render: (t: MaintenanceTask) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{t.title}</p>
          <p className="text-slate-400 text-[11px]">{t.hostel?.name || 'Main Block'}</p>
        </div>
      ),
    },
    {
      header: 'Estimated / Actual Cost',
      render: (t: MaintenanceTask) => (
        <div className="text-xs">
          <p className="text-slate-600 font-medium">Est: ₹{t.estimatedCost.toLocaleString()}</p>
          <p className="text-emerald-700 font-bold">Act: ₹{t.actualCost.toLocaleString()}</p>
        </div>
      ),
    },
    {
      header: 'Assigned Tech',
      render: (t: MaintenanceTask) => (
        <span className="text-xs font-semibold text-slate-800">
          {t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (t: MaintenanceTask) => (
        <Badge
          variant={
            t.status === 'COMPLETED'
              ? 'success'
              : t.status === 'IN_PROGRESS'
              ? 'warning'
              : 'neutral'
          }
        >
          {t.status}
        </Badge>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (t: MaintenanceTask) => {
        if (!hasRole(['SUPER_ADMIN', 'ADMIN', 'MAINTENANCE'])) return null;
        if (t.status === 'COMPLETED') return <span className="text-xs text-slate-400">Done</span>;

        return (
          <button
            onClick={() => handleUpdateStatus(t.id, 'COMPLETED')}
            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-xs transition-colors"
          >
            Mark Done
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Maintenance & Repairs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Facility upkeep work orders, staff assignments, and expense tracking
          </p>
        </div>

        {hasRole(['SUPER_ADMIN', 'ADMIN', 'MAINTENANCE', 'WARDEN']) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Create Work Order
          </button>
        )}
      </div>

      {/* Summary KPI Banner */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-slate-400 font-bold">Total Work Orders</span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{summary.totalTasks}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-amber-600 font-bold">Pending Orders</span>
            <p className="text-xl font-extrabold text-amber-700 mt-1">{summary.pendingTasksCount}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-emerald-600 font-bold">Completed Repairs</span>
            <p className="text-xl font-extrabold text-emerald-700 mt-1">{summary.completedCount}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-purple-600 font-bold">Total Repair Cost</span>
            <p className="text-xl font-extrabold text-purple-700 mt-1">₹{summary.totalMaintenanceCost?.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Task Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
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
        data={tasks}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search work orders by title, task number..."
      />

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Maintenance Work Order">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Hostel *</label>
            <select
              value={formData.hostelId}
              onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Corridor LED light replacement"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Cost (₹)</label>
              <input
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Work Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
