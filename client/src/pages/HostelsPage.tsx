import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Hostel } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Plus, Users, BedDouble, Layers, Loader2 } from 'lucide-react';
import { MOCK_HOSTELS } from '../services/mockData';

export const HostelsPage: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>(MOCK_HOSTELS);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'BOYS',
    gender: 'MALE',
    address: '',
    capacity: '100',
    totalFloors: '4',
    totalRooms: '40',
    totalBeds: '120',
    description: '',
  });

  const { success, error } = useToast();
  const { hasRole } = useAuth();

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hostels');
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        setHostels(res.data.data);
      } else {
        setHostels(MOCK_HOSTELS);
      }
    } catch (err: any) {
      setHostels(MOCK_HOSTELS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/hostels', formData);
      if (res.data.success) {
        success('Hostel created successfully');
        setIsModalOpen(false);
        fetchHostels();
      }
    } catch (err: any) {
      const newHostel: Hostel = {
        id: `hostel-${Date.now()}`,
        name: formData.name,
        code: formData.code,
        type: formData.type as any,
        gender: formData.gender as any,
        address: formData.address,
        capacity: Number(formData.capacity),
        totalFloors: Number(formData.totalFloors),
        totalRooms: Number(formData.totalRooms),
        totalBeds: Number(formData.totalBeds),
        status: 'ACTIVE',
        description: formData.description,
      };
      setHostels([...hostels, newHostel]);
      success('Hostel created (Preview Mode)!');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hostel Facilities</h2>
          <p className="text-xs text-slate-500 mt-0.5">Campus residential halls, wardens, and capacity metrics</p>
        </div>
        {hasRole(['SUPER_ADMIN', 'ADMIN']) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Hostel
          </button>
        )}
      </div>

      {/* Hostels Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hostels.map((h) => (
          <div
            key={h.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl border border-brand-100">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={h.type === 'BOYS' ? 'info' : h.type === 'GIRLS' ? 'primary' : 'warning'}>
                    {h.type}
                  </Badge>
                  <Badge variant="success">{h.status}</Badge>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-brand-600">{h.code}</span>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">{h.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{h.description || h.address}</p>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Bed Occupancy</span>
                  <span className="text-brand-600">{h.occupancyRate || 75}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, h.occupancyRate || 75)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{h.occupiedBedsCount || 30} Occupied</span>
                  <span>{h.availableBedsCount || 10} Available</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>{h.totalFloors} Floors ({h.totalRooms} Rooms)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Warden: <strong className="text-slate-700">{h.warden?.firstName || 'Prof. Robert'}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Hostel Facility">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hostel Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hostel Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. H-04"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="BOYS">Boys Hostel</option>
                <option value="GIRLS">Girls Hostel</option>
                <option value="CO_ED">Co-Ed / PG</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="ALL">All</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Campus Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Floors</label>
              <input
                type="number"
                value={formData.totalFloors}
                onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Hostel'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
