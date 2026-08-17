import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Payment, StudentFee } from '../types';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { PrintableReceiptModal } from '../components/PrintableReceiptModal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Receipt, Plus, Printer, Loader2, Download } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedFeeId = searchParams.get('studentFeeId');

  const [payments, setPayments] = useState<Payment[]>([]);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');

  // Printable receipt state
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<Payment | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Record Payment Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payForm, setPayForm] = useState({
    studentFeeId: '',
    amount: '',
    paymentMethod: 'UPI',
    transactionRef: '',
    remarks: 'Hostel Fee Clearance',
  });

  const { success, error } = useToast();
  const { hasRole, user } = useAuth();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter;
      if (user?.role === 'STUDENT' && user.student) params.studentId = user.student.id;

      const [pRes, sfRes] = await Promise.all([
        api.get('/fees/payments', { params }),
        api.get('/fees/student-fees'),
      ]);

      if (pRes.data.success) setPayments(pRes.data.data);
      if (sfRes.data.success) {
        const pending = sfRes.data.data.filter((f: StudentFee) => f.status !== 'PAID');
        setStudentFees(pending);
        if (preselectedFeeId) {
          const match = pending.find((f: StudentFee) => f.id === preselectedFeeId);
          if (match) {
            setPayForm((prev) => ({
              ...prev,
              studentFeeId: match.id,
              amount: String(match.balanceAmount),
            }));
            setIsPayModalOpen(true);
          }
        }
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [search, paymentMethodFilter]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.studentFeeId || !payForm.amount) {
      error('Please select fee invoice and amount');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/fees/payments/record', payForm);
      if (res.data.success) {
        success('Payment recorded successfully!');
        setIsPayModalOpen(false);
        fetchPayments();
        // Prompt user with receipt
        setSelectedPaymentForReceipt(res.data.data);
        setIsReceiptModalOpen(true);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Payment recording failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Receipt / Invoice No',
      render: (p: Payment) => (
        <div>
          <p className="font-extrabold text-slate-900 text-xs">{p.invoiceNo}</p>
          <span className="text-[11px] text-slate-400 font-mono">{p.transactionRef || 'OFFLINE'}</span>
        </div>
      ),
    },
    {
      header: 'Scholar',
      render: (p: Payment) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">
            {p.student?.user?.firstName} {p.student?.user?.lastName}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">{p.student?.enrollmentNo}</span>
        </div>
      ),
    },
    {
      header: 'Fee Scheme',
      render: (p: Payment) => (
        <span className="text-xs text-slate-700 font-medium">
          {p.studentFee?.feeStructure?.name || 'Semester Package'}
        </span>
      ),
    },
    {
      header: 'Paid Amount',
      render: (p: Payment) => (
        <span className="font-extrabold text-emerald-600 text-xs">
          ₹{p.amount?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Method',
      render: (p: Payment) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-xs">
          {p.paymentMethod}
        </span>
      ),
    },
    {
      header: 'Payment Date',
      render: (p: Payment) => (
        <span className="text-xs text-slate-500">
          {new Date(p.paymentDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Receipt',
      className: 'text-right',
      render: (p: Payment) => (
        <button
          onClick={() => {
            setSelectedPaymentForReceipt(p);
            setIsReceiptModalOpen(true);
          }}
          className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-lg border border-brand-200 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Receipt
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payment Ledger & Receipts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Collection ledger, digital payment acknowledgements, and printable tax receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://localhost:5000/api/reports/export/payments"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </a>
          <button
            onClick={() => setIsPayModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Payment Method</label>
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Debit / Credit Card</option>
            <option value="CASH">Cash Deposit</option>
            <option value="BANK_TRANSFER">Bank NEFT/RTGS</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setPaymentMethodFilter('');
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
        data={payments}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by invoice no, transaction ref, student name..."
      />

      {/* Record Payment Modal */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Record Fee Payment">
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Pending Invoice *</label>
            <select
              required
              value={payForm.studentFeeId}
              onChange={(e) => {
                const feeId = e.target.value;
                const found = studentFees.find((f) => f.id === feeId);
                setPayForm({
                  ...payForm,
                  studentFeeId: feeId,
                  amount: found ? String(found.balanceAmount) : '',
                });
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Select Pending Fee Invoice</option>
              {studentFees.map((sf) => (
                <option key={sf.id} value={sf.id}>
                  {sf.student?.user?.firstName} {sf.student?.user?.lastName} ({sf.student?.enrollmentNo}) - Due: ₹{sf.balanceAmount.toLocaleString()} ({sf.feeStructure?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount to Pay (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={payForm.amount}
                onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method *</label>
              <select
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="CASH">Cash at Accounts Desk</option>
                <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Transaction Ref / Bank Ref Number</label>
            <input
              type="text"
              placeholder="e.g. UPI-9988223344 or CASH-SLIP-102"
              value={payForm.transactionRef}
              onChange={(e) => setPayForm({ ...payForm, transactionRef: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remarks</label>
            <input
              type="text"
              value={payForm.remarks}
              onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Payment & Generate Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      <PrintableReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        payment={selectedPaymentForReceipt}
      />
    </div>
  );
};
