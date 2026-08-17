import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Room, Hostel, Floor } from '../types';
import { VisualRoomGrid } from '../components/VisualRoomGrid';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { DoorOpen, Plus, LayoutGrid, List, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [search, setSearch] = useState('');

  // Add Room Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    hostelId: '',
    floorId: '',
    roomNumber: '',
    type: 'DOUBLE',
    capacity: '2',
    feePerMonth: '5000',
    amenities: 'Study Table, Ceiling Fan, Wardrobe',
  });

  const { success, error } = useToast();
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchHostelsAndFloors = async () => {
    try {
      const [hRes, fRes] = await Promise.all([
        api.get('/hostels'),
        api.get('/hostels/floors/list'),
      ]);
      if (hRes.data.success) {
        setHostels(hRes.data.data);
        if (hRes.data.data.length > 0 && !selectedHostel) {
          setSelectedHostel(hRes.data.data[0].id);
        }
      }
      if (fRes.data.success) setFloors(fRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedHostel) params.hostelId = selectedHostel;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedType) params.type = selectedType;
      if (search) params.search = search;

      const res = await api.get('/hostels/rooms/list', { params });
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostelsAndFloors();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [selectedHostel, selectedStatus, selectedType, search]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hostelId || !formData.floorId) {
      error('Please select both a hostel and a floor');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/hostels/rooms', formData);
      if (res.data.success) {
        success('Room and individual beds configured successfully!');
        setIsModalOpen(false);
        fetchRooms();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tableColumns = [
    {
      header: 'Room Number',
      render: (r: Room) => (
        <div>
          <p className="font-extrabold text-slate-900 text-sm">Room {r.roomNumber}</p>
          <span className="text-xs text-slate-400 font-medium">Floor {r.floor?.floorNumber || 'G'}</span>
        </div>
      ),
    },
    {
      header: 'Hostel',
      render: (r: Room) => <span className="font-semibold text-slate-800">{r.hostel?.name}</span>,
    },
    {
      header: 'Room Type',
      accessor: 'type',
    },
    {
      header: 'Occupancy Status',
      render: (r: Room) => {
        const s = r.computedStatus || r.status;
        return (
          <Badge variant={s === 'AVAILABLE' ? 'success' : s === 'PARTIALLY_OCCUPIED' ? 'warning' : s === 'FULL' ? 'danger' : 'neutral'}>
            {s} ({r.currentOccupancy}/{r.capacity} Beds)
          </Badge>
        );
      },
    },
    {
      header: 'Monthly Fee',
      render: (r: Room) => <span className="font-bold text-slate-900">₹{r.feePerMonth?.toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Room Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive visual room availability matrix and bed layout configuration
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="p-1 bg-white border border-slate-200 rounded-xl flex items-center shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Visual Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Data Table
            </button>
          </div>

          {hasRole(['SUPER_ADMIN', 'ADMIN']) && (
            <button
              onClick={() => {
                if (hostels.length > 0) setFormData((prev) => ({ ...prev, hostelId: hostels[0].id }));
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add Room
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
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
          <label className="block text-slate-500 font-semibold mb-1">Availability Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE (Green)</option>
            <option value="PARTIALLY_OCCUPIED">PARTIALLY OCCUPIED (Yellow)</option>
            <option value="FULL">FULL (Red)</option>
            <option value="MAINTENANCE">MAINTENANCE (Gray)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-500 font-semibold mb-1">Room Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="SINGLE">Single</option>
            <option value="DOUBLE">Double</option>
            <option value="TRIPLE">Triple</option>
            <option value="FOUR_BED">Four Bed</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedHostel('');
              setSelectedStatus('');
              setSelectedType('');
              setSearch('');
            }}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Main Content: Grid View or Table View */}
      {viewMode === 'grid' ? (
        <VisualRoomGrid
          rooms={rooms}
          onAllocateBed={(room, bed) => {
            navigate(`/allocations?hostelId=${room.hostelId}&roomId=${room.id}&bedId=${bed.id}`);
          }}
        />
      ) : (
        <DataTable
          columns={tableColumns}
          data={rooms}
          loading={loading}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search rooms by number..."
        />
      )}

      {/* Add Room Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Room & Beds">
        <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hostel *</label>
              <select
                required
                value={formData.hostelId}
                onChange={(e) => {
                  setFormData({ ...formData, hostelId: e.target.value });
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Select Hostel</option>
                {hostels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Floor *</label>
              <select
                required
                value={formData.floorId}
                onChange={(e) => setFormData({ ...formData, floorId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Select Floor</option>
                {floors
                  .filter((f) => !formData.hostelId || f.hostelId === formData.hostelId)
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (Level {f.floorNumber})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Room Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. 101, 204"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const t = e.target.value;
                  const cap = t === 'SINGLE' ? '1' : t === 'DOUBLE' ? '2' : t === 'TRIPLE' ? '3' : '4';
                  setFormData({ ...formData, type: t, capacity: cap });
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="TRIPLE">Triple</option>
                <option value="FOUR_BED">Four Bed</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Monthly Fee (₹)</label>
              <input
                type="number"
                value={formData.feePerMonth}
                onChange={(e) => setFormData({ ...formData, feePerMonth: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Amenities</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Room'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
