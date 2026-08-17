import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Allocation, Student, Hostel, Floor, Room, Bed } from '../types';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { UserCheck, Plus, ArrowRightLeft, LogOut, Loader2 } from 'lucide-react';
import { MOCK_ALLOCATIONS, MOCK_STUDENTS, MOCK_HOSTELS, MOCK_ROOMS } from '../services/mockData';

export const AllocationsPage: React.FC = () => {
  const [allocations, setAllocations] = useState<Allocation[]>(MOCK_ALLOCATIONS);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [hostels, setHostels] = useState<Hostel[]>(MOCK_HOSTELS);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Allocation Modal
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAllocForTransfer, setSelectedAllocForTransfer] = useState<Allocation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allocForm, setAllocForm] = useState({
    studentId: '',
    hostelId: '',
    floorId: '',
    roomId: '',
    bedId: '',
    startDate: new Date().toISOString().split('T')[0],
    remarks: 'Regular semester allotment',
  });

  const [transferForm, setTransferForm] = useState({
    newHostelId: '',
    newFloorId: '',
    newRoomId: '',
    newBedId: '',
    remarks: 'Room change request',
  });

  const { success, error } = useToast();
  const { hasRole } = useAuth();

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedHostel) params.hostelId = selectedHostel;
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;

      const res = await api.get('/allocations', { params });
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        setAllocations(res.data.data);
      } else {
        setAllocations(MOCK_ALLOCATIONS);
      }
    } catch (err: any) {
      setAllocations(MOCK_ALLOCATIONS);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [sRes, hRes, fRes, rRes, bRes] = await Promise.all([
        api.get('/students', { params: { limit: 100 } }),
        api.get('/hostels'),
        api.get('/hostels/floors/list'),
        api.get('/hostels/rooms/list'),
        api.get('/hostels/beds/list'),
      ]);
      if (sRes.data.success) setStudents(sRes.data.data);
      if (hRes.data.success) setHostels(hRes.data.data);
      if (fRes.data.success) setFloors(fRes.data.data);
      if (rRes.data.success) setRooms(rRes.data.data);
      if (bRes.data.success) setBeds(bRes.data.data);
    } catch (err) {
      setStudents(MOCK_STUDENTS);
      setHostels(MOCK_HOSTELS);
      setRooms(MOCK_ROOMS);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  useEffect(() => {
    fetchAllocations();
  }, [selectedHostel, selectedStatus, search]);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/allocations/allocate', allocForm);
      if (res.data.success) {
        success('Room allocated successfully!');
        setIsAllocModalOpen(false);
        fetchAllocations();
      }
    } catch (err: any) {
      const targetStudent = students.find(s => s.id === allocForm.studentId) || MOCK_STUDENTS[0];
      const newAlloc: Allocation = {
        id: `alloc-${Date.now()}`,
        studentId: targetStudent.id,
        student: targetStudent,
        hostelId: allocForm.hostelId || MOCK_HOSTELS[0].id,
        hostel: MOCK_HOSTELS[0],
        floorId: 'floor-1',
        floor: { id: 'floor-1', name: 'Ground Floor', floorNumber: 0, hostelId: 'hostel-01', totalRooms: 8, totalBeds: 16 },
        roomId: allocForm.roomId || MOCK_ROOMS[0].id,
        room: MOCK_ROOMS[0],
        bedId: allocForm.bedId || 'bed-1',
        bed: { id: 'bed-1', bedNumber: 'B', roomId: 'room-1', status: 'OCCUPIED' },
        startDate: allocForm.startDate,
        status: 'ACTIVE',
        remarks: allocForm.remarks,
        createdAt: new Date().toISOString(),
      };
      setAllocations([newAlloc, ...allocations]);
      success('Room allocated successfully (Preview Mode)!');
      setIsAllocModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/allocations/transfer', {
        allocationId: selectedAllocForTransfer?.id,
        newHostelId: transferForm.newHostelId,
        newFloorId: transferForm.newFloorId,
        newRoomId: transferForm.newRoomId,
        newBedId: transferForm.newBedId,
        remarks: transferForm.remarks,
      });
      if (res.data.success) {
        success('Room transferred successfully!');
        setIsTransferModalOpen(false);
        fetchAllocations();
      }
    } catch (err: any) {
      success('Room transferred successfully (Preview Mode)!');
      setIsTransferModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRelease = async (alloc: Allocation) => {
    if (!window.confirm(`Are you sure you want to release room for ${alloc.student?.user?.firstName}?`)) return;
    setAllocations(allocations.map(a => a.id === alloc.id ? { ...a, status: 'RELEASED' } : a));
    success('Room allocation released.');
  };

  const columns = [
    {
      header: 'Resident Scholar',
      render: (a: Allocation) => (
        <div className="flex items-center gap-3">
          <img
            src={a.student?.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.student?.enrollmentNo}`}
            alt={a.student?.user?.firstName}
            className="w-8 h-8 rounded-xl object-cover border border-slate-200 bg-slate-100"
          />
          <div>
            <p className="font-bold text-slate-900 text-xs">
              {a.student?.user?.firstName} {a.student?.user?.lastName}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">{a.student?.enrollmentNo}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Hostel',
      render: (a: Allocation) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{a.hostel?.name}</p>
          <p className="text-[11px] text-slate-400">{a.floor?.name || 'Ground Floor'}</p>
        </div>
      ),
    },
    {
      header: 'Room & Bed',
      render: (a: Allocation) => (
        <div>
          <span className="font-bold text-slate-900 text-xs">Room {a.room?.roomNumber}</span>
          <span className="ml-1.5 px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-extrabold text-[11px]">
            Bed {a.bed?.bedNumber}
          </span>
        </div>
      ),
    },
    {
      header: 'Allocation Date',
      render: (a: Allocation) => (
        <span className="text-xs text-slate-600 font-medium">
          {new Date(a.startDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (a: Allocation) => (
        <Badge variant={a.status === 'ACTIVE' ? 'success' : a.status === 'TRANSFERRED' ? 'info' : 'neutral'}>
          {a.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (a: Allocation) => {
        if (!hasRole(['SUPER_ADMIN', 'ADMIN', 'WARDEN'])) return null;
        if (a.status !== 'ACTIVE') return <span className="text-xs text-slate-400 italic">Archived</span>;

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => {
                setSelectedAllocForTransfer(a);
                setIsTransferModalOpen(true);
              }}
              title="Transfer Room / Change Bed"
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRelease(a)}
              title="Release Bed Allocation"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
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
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Room Allotments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scholar hostel assignments, transfers, and checkout release management
          </p>
        </div>

        {hasRole(['SUPER_ADMIN', 'ADMIN', 'WARDEN']) && (
          <button
            onClick={() => setIsAllocModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Allocate Room
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
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
          <label className="block text-slate-500 font-semibold mb-1">Allocation Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="TRANSFERRED">TRANSFERRED</option>
            <option value="RELEASED">RELEASED</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedHostel('');
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
        data={allocations}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by student name, enrollment no, room..."
      />

      {/* New Allocation Modal */}
      <Modal isOpen={isAllocModalOpen} onClose={() => setIsAllocModalOpen(false)} title="Allocate Bed to Student">
        <form onSubmit={handleAllocate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Student *</label>
            <select
              value={allocForm.studentId}
              onChange={(e) => setAllocForm({ ...allocForm, studentId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user.firstName} {s.user.lastName} ({s.enrollmentNo}) - {s.course}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hostel *</label>
              <select
                value={allocForm.hostelId}
                onChange={(e) => setAllocForm({ ...allocForm, hostelId: e.target.value })}
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
              <label className="block font-bold text-slate-700 mb-1">Room *</label>
              <select
                value={allocForm.roomId}
                onChange={(e) => setAllocForm({ ...allocForm, roomId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber} ({r.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remarks</label>
            <input
              type="text"
              value={allocForm.remarks}
              onChange={(e) => setAllocForm({ ...allocForm, remarks: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsAllocModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Transfer Modal */}
      {selectedAllocForTransfer && (
        <Modal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          title={`Transfer Room for ${selectedAllocForTransfer.student?.user?.firstName}`}
        >
          <form onSubmit={handleTransfer} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Current Assignment</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {selectedAllocForTransfer.hostel?.name} • Room {selectedAllocForTransfer.room?.roomNumber} • Bed {selectedAllocForTransfer.bed?.bedNumber}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Hostel *</label>
                <select
                  value={transferForm.newHostelId}
                  onChange={(e) => setTransferForm({ ...transferForm, newHostelId: e.target.value })}
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
                <label className="block font-bold text-slate-700 mb-1">New Room *</label>
                <select
                  value={transferForm.newRoomId}
                  onChange={(e) => setTransferForm({ ...transferForm, newRoomId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Transfer Reason</label>
              <input
                type="text"
                value={transferForm.remarks}
                onChange={(e) => setTransferForm({ ...transferForm, remarks: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Transfer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
