import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Guardian } from '../types';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Plus, Loader2 } from 'lucide-react';

export const GuardiansPage: React.FC = () => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relation: 'FATHER',
    phone: '',
    email: '',
    occupation: '',
    address: '',
  });

  const { success, error } = useToast();
  const { hasRole } = useAuth();

  const fetchGuardians = async () => {
    try {
      setLoading(true);
      const res = await api.get('/guardians', { params: { search } });
      if (res.data.success) {
        setGuardians(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch guardians');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuardians();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/guardians', formData);
      if (res.data.success) {
        success('Guardian added successfully');
        setIsModalOpen(false);
        fetchGuardians();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create guardian');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Guardian Name',
      render: (g: Guardian) => (
        <div>
          <p className="font-bold text-slate-900">{g.name}</p>
          <span className="text-xs text-brand-600 font-semibold">{g.relation}</span>
        </div>
      ),
    },
    {
      header: 'Contact Details',
      render: (g: Guardian) => (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{g.phone}</p>
          <p className="text-slate-400">{g.email || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Occupation',
      accessor: 'occupation',
    },
    {
      header: 'Linked Scholars',
      render: (g: Guardian) => (
        <div className="flex flex-wrap gap-1">
          {g.students && g.students.length > 0 ? (
            g.students.map((st, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium text-slate-700">
                {st.student.user.firstName} {st.student.user.lastName} ({st.student.enrollmentNo})
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">No linked student</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Guardian Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Parent and local guardian contacts directory</p>
        </div>
        {hasRole(['SUPER_ADMIN', 'ADMIN', 'WARDEN']) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Guardian
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={guardians}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search guardians by name or phone..."
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Guardian Record">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Relationship *</label>
              <select
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="FATHER">Father</option>
                <option value="MOTHER">Mother</option>
                <option value="LOCAL_GUARDIAN">Local Guardian</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
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
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Guardian'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
