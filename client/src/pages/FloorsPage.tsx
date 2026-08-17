import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Floor, Hostel } from '../types';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Layers, Plus, Loader2 } from 'lucide-react';

export const FloorsPage: React.FC = () => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    hostelId: '',
    floorNumber: '1',
    name: 'Ground Floor',
    totalRooms: '10',
    totalBeds: '30',
  });

  const { success, error } = useToast();
  const { hasRole } = useAuth();

  const fetchHostels = async () => {
    try {
      const res = await api.get('/hostels');
      if (res.data.success) {
        setHostels(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFloors = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedHostel) params.hostelId = selectedHostel;

      const res = await api.get('/hostels/floors/list', { params });
      if (res.data.success) {
        setFloors(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch floors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    fetchFloors();
  }, [selectedHostel]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hostelId) {
      error('Please select a hostel');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/hostels/floors', formData);
      if (res.data.success) {
        success('Floor added successfully');
        setIsModalOpen(false);
        fetchFloors();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to add floor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Floor Name & Number',
      render: (f: Floor) => (
        <div>
          <p className="font-bold text-slate-900">{f.name}</p>
          <span className="text-xs text-slate-400 font-mono">Level {f.floorNumber}</span>
        </div>
      ),
    },
    {
      header: 'Hostel Facility',
      render: (f: Floor) => (
        <span className="font-semibold text-slate-800">{f.hostel?.name} ({f.hostel?.code})</span>
      ),
    },
    {
      header: 'Total Rooms',
      accessor: 'totalRooms',
    },
    {
      header: 'Configured Beds',
      accessor: 'totalBeds',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Floor Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Floor layout directory across all hostel premises</p>
        </div>
        {hasRole(['SUPER_ADMIN', 'ADMIN']) && (
          <button
            onClick={() => {
              if (hostels.length > 0) setFormData({ ...formData, hostelId: hostels[0].id });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Floor
          </button>
        )}
      </div>

      {/* Filter by Hostel */}
      <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <label className="font-bold text-slate-700">Filter by Hostel:</label>
        <select
          value={selectedHostel}
          onChange={(e) => setSelectedHostel(e.target.value)}
          className="p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
        >
          <option value="">All Hostels</option>
          {hostels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} ({h.code})
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={floors} loading={loading} />

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Floor Configuration">
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
                  {h.name} ({h.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Floor Level *</label>
              <input
                type="number"
                min="0"
                max="20"
                required
                value={formData.floorNumber}
                onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Floor Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. 1st Floor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Rooms</label>
              <input
                type="number"
                value={formData.totalRooms}
                onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Beds</label>
              <input
                type="number"
                value={formData.totalBeds}
                onChange={(e) => setFormData({ ...formData, totalBeds: e.target.value })}
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Floor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
