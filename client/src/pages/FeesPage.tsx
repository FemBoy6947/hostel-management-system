import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FeeStructure, StudentFee, Student, Hostel } from '../types';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Plus, FileText, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeesPage: React.FC = () => {
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [structureForm, setStructureForm] = useState({
    name: 'Spring Semester 2026 Regular',
    hostelId: '',
    roomType: 'DOUBLE',
    academicYear: '2025-2026',
    semester: '2',
    hostelFee: '30000',
    messFee: '20000',
    maintenanceFee: '3000',
    securityDeposit: '5000',
    otherCharges: '1000',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const [assignForm, setAssignForm] = useState({
    studentId: '',
    feeStructureId: '',
    discountAmount: '0',
    remarks: '',
  });

  const { success, error } = useToast();
  const { hasRole, user } = useAuth();

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus) params.status = selectedStatus;
      if (search) params.search = search;
      if (user?.role === 'STUDENT' && user.student) params.studentId = user.student.id;

      const [sfRes, structRes, studRes, hRes] = await Promise.all([
        api.get('/fees/student-fees', { params }),
        api.get('/fees/structures'),
        api.get('/students', { params: { limit: 100 } }),
        api.get('/hostels'),
      ]);

      if (sfRes.data.success) setStudentFees(sfRes.data.data);
      if (structRes.data.success) setFeeStructures(structRes.data.data);
      if (studRes.data.success) setStudents(studRes.data.data);
      if (hRes.data.success) setHostels(hRes.data.data);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch fee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, [selectedStatus, search]);

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!structureForm.hostelId) {
      error('Please select a hostel');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/fees/structures', structureForm);
      if (res.data.success) {
        success('Fee structure created!');
        setIsStructureModalOpen(false);
        fetchFeeData();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create fee structure');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.studentId || !assignForm.feeStructureId) {
      error('Please select a student and fee package');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/fees/student-fees/assign', assignForm);
      if (res.data.success) {
        success('Fee invoice assigned to scholar!');
        setIsAssignModalOpen(false);
        fetchFeeData();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to assign fee invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Resident Scholar',
      render: (f: StudentFee) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">
            {f.student?.user?.firstName} {f.student?.user?.lastName}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">{f.student?.enrollmentNo}</span>
        </div>
      ),
    },
    {
      header: 'Fee Scheme',
      render: (f: StudentFee) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{f.feeStructure?.name}</p>
          <span className="text-[11px] text-slate-400">{f.feeStructure?.academicYear} (Sem {f.feeStructure?.semester})</span>
        </div>
      ),
    },
    {
      header: 'Invoiced Amount',
      render: (f: StudentFee) => (
        <span className="font-bold text-slate-900 text-xs">₹{f.totalAmount?.toLocaleString()}</span>
      ),
    },
    {
      header: 'Paid / Balance',
      render: (f: StudentFee) => (
        <div className="text-xs">
          <p className="font-semibold text-emerald-600">Paid: ₹{f.paidAmount?.toLocaleString()}</p>
          <p className="font-bold text-amber-600">Due: ₹{f.balanceAmount?.toLocaleString()}</p>
        </div>
      ),
    },
    {
      header: 'Due Date',
      render: (f: StudentFee) => (
        <span className="text-xs text-slate-600 font-medium">
          {new Date(f.dueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (f: StudentFee) => (
        <Badge variant={f.status === 'PAID' ? 'success' : f.status === 'PARTIALLY_PAID' ? 'warning' : 'danger'}>
          {f.status}
        </Badge>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (f: StudentFee) => {
        if (f.status === 'PAID') {
          return <span className="text-xs font-bold text-emerald-600">Cleared</span>;
        }
        return (
          <Link
            to={`/payments?studentFeeId=${f.id}`}
            className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold shadow-sm"
          >
            Pay Now
          </Link>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fee Invoicing & Dues</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hostel accommodation fees, mess charges, waivers, and semester billing
          </p>
        </div>

        {hasRole(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']) && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (hostels.length > 0) setStructureForm((prev) => ({ ...prev, hostelId: hostels[0].id }));
                setIsStructureModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
            >
              + Fee Structure
            </button>
            <button
              onClick={() => {
                if (students.length > 0) setAssignForm((prev) => ({ ...prev, studentId: students[0].id }));
                if (feeStructures.length > 0) setAssignForm((prev) => ({ ...prev, feeStructureId: feeStructures[0].id }));
                setIsAssignModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
            >
              + Assign Fee Invoice
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Invoice Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="OVERDUE">OVERDUE</option>
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
        data={studentFees}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by student name, enrollment no..."
      />

      {/* Modal: New Fee Structure */}
      <Modal isOpen={isStructureModalOpen} onClose={() => setIsStructureModalOpen(false)} title="Create New Fee Structure">
        <form onSubmit={handleCreateStructure} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Scheme Name *</label>
            <input
              type="text"
              required
              value={structureForm.name}
              onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hostel *</label>
              <select
                value={structureForm.hostelId}
                onChange={(e) => setStructureForm({ ...structureForm, hostelId: e.target.value })}
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
              <label className="block font-bold text-slate-700 mb-1">Room Type</label>
              <select
                value={structureForm.roomType}
                onChange={(e) => setStructureForm({ ...structureForm, roomType: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="SINGLE">Single Occupancy</option>
                <option value="DOUBLE">Double Sharing</option>
                <option value="TRIPLE">Triple Sharing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hostel Fee (₹)</label>
              <input
                type="number"
                value={structureForm.hostelFee}
                onChange={(e) => setStructureForm({ ...structureForm, hostelFee: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mess Fee (₹)</label>
              <input
                type="number"
                value={structureForm.messFee}
                onChange={(e) => setStructureForm({ ...structureForm, messFee: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Maintenance (₹)</label>
              <input
                type="number"
                value={structureForm.maintenanceFee}
                onChange={(e) => setStructureForm({ ...structureForm, maintenanceFee: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsStructureModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Fee Structure'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Fee to Student */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Fee Invoice to Student">
        <form onSubmit={handleAssignFee} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Scholar *</label>
            <select
              required
              value={assignForm.studentId}
              onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user.firstName} {s.user.lastName} ({s.enrollmentNo})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Fee Package Scheme *</label>
            <select
              required
              value={assignForm.feeStructureId}
              onChange={(e) => setAssignForm({ ...assignForm, feeStructureId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {feeStructures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} - ₹{(f.hostelFee + f.messFee + f.maintenanceFee + f.securityDeposit).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Scholarship / Waiver Discount (₹)</label>
            <input
              type="number"
              value={assignForm.discountAmount}
              onChange={(e) => setAssignForm({ ...assignForm, discountAmount: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
