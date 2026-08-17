import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bed, Hostel } from '../types';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { BedDouble, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const BedsPage: React.FC = () => {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const { success, error } = useToast();
  const { hasRole } = useAuth();

  const fetchHostels = async () => {
    try {
      const res = await api.get('/hostels');
      if (res.data.success) setHostels(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedHostel) params.hostelId = selectedHostel;
      if (selectedStatus) params.status = selectedStatus;

      const res = await api.get('/hostels/beds/list', { params });
      if (res.data.success) {
        setBeds(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch beds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    fetchBeds();
  }, [selectedHostel, selectedStatus]);

  const handleUpdateBedStatus = async (id: string, status: string) => {
    try {
      const res = await api.put(`/hostels/beds/${id}/status`, { status });
      if (res.data.success) {
        success('Bed status updated');
        fetchBeds();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update bed status');
    }
  };

  const columns = [
    {
      header: 'Bed Identifier',
      render: (b: Bed) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <BedDouble className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900">Bed {b.bedNumber}</p>
            <p className="text-xs text-slate-400">Room {b.room?.roomNumber}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Hostel & Floor',
      render: (b: Bed) => (
        <div>
          <p className="font-semibold text-slate-800">{b.room?.hostel?.name}</p>
          <p className="text-xs text-slate-400">{b.room?.floor?.name}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (b: Bed) => (
        <Badge variant={b.status === 'AVAILABLE' ? 'success' : b.status === 'OCCUPIED' ? 'danger' : 'neutral'}>
          {b.status}
        </Badge>
      ),
    },
    {
      header: 'Assigned Scholar',
      render: (b: Bed) => {
        const activeAlloc = b.allocations && b.allocations[0];
        if (!activeAlloc) return <span className="text-xs text-slate-400 italic">Unassigned</span>;
        return (
          <span className="font-bold text-slate-900 text-xs">
            {activeAlloc.student?.user?.firstName} {activeAlloc.student?.user?.lastName}
          </span>
        );
      },
    },
    {
      header: 'Quick Action',
      className: 'text-right',
      render: (b: Bed) => {
        if (!hasRole(['SUPER_ADMIN', 'ADMIN', 'WARDEN'])) return null;
        if (b.status === 'MAINTENANCE') {
          return (
            <button
              onClick={() => handleUpdateBedStatus(b.id, 'AVAILABLE')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg"
            >
              Mark Available
            </button>
          );
        }
        if (b.status === 'AVAILABLE') {
          return (
            <button
              onClick={() => handleUpdateBedStatus(b.id, 'MAINTENANCE')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg"
            >
              Set Maintenance
            </button>
          );
        }
        return <span className="text-xs text-slate-400">Active</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bed Master Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Individual residential bed tracking and maintenance states</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Hostel</label>
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Hostels</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 font-semibold mb-1">Bed Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="OCCUPIED">OCCUPIED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={beds} loading={loading} />
    </div>
  );
};
