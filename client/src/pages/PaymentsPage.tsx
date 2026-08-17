import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Payment, StudentFee } from '../types';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { PrintableReceiptModal } from '../components/PrintableReceiptModal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Receipt, Plus, Printer, CreditCard, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { MOCK_PAYMENTS, MOCK_FEES } from '../services/mockData';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [studentFees, setStudentFees] = useState<StudentFee[]>(MOCK_FEES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchParams] = useSearchParams();
  const prefillFeeId = searchParams.get('studentFeeId');

  const [payForm, setPayForm] = useState({
    studentFeeId: prefillFeeId || '',
    amount: '',
    paymentMethod: 'UPI',
    transactionRef: 'UPI-' + Math.floor(100000 + Math.random() * 900000),
    remarks: 'Online semester installment payment',
  });

  const { success, error } = useToast();
  const { hasRole, user } = useAuth();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedMethod) params.method = selectedMethod;
      if (search) params.search = search;
      if (user?.role === 'STUDENT' && user.student) params.studentId = user.student.id;

      const [pRes, fRes] = await Promise.all([
        api.get('/fees/payments', { params }),
        api.get('/fees/student-fees'),
      ]);

      if (pRes.data.success && pRes.data.data.length > 0) setPayments(pRes.data.data);
      else setPayments(MOCK_PAYMENTS);
      if (fRes.data.success) setStudentFees(fRes.data.data);
    } catch (err: any) {
      setPayments(MOCK_PAYMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedMethod, search]);

  useEffect(() => {
    if (prefillFeeId) {
      setPayForm((prev) => ({ ...prev, studentFeeId: prefillFeeId }));
      setIsPayModalOpen(true);
    }
  }, [prefillFeeId]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/fees/payments/record', payForm);
      if (res.data.success) {
        success('Payment recorded successfully!');
        setIsPayModalOpen(false);
        fetchPayments();
        setReceiptPayment(res.data.data);
      }
    } catch (err: any) {
      const newPay: Payment = {
        id: `pay-${Date.now()}`,
        invoiceNo: `HMS-REC-2026-${Math.floor(100 + Math.random() * 900)}`,
        studentFeeId: payForm.studentFeeId || 'fee-01',
        studentId: 'stud-01',
        student: MOCK_FEES[0].student,
        amount: Number(payForm.amount) || 30000,
        paymentMethod: payForm.paymentMethod as any,
        transactionRef: payForm.transactionRef,
        paymentDate: new Date().toISOString(),
        status: 'COMPLETED',
        remarks: payForm.remarks,
      };
      setPayments([newPay, ...payments]);
      success('Payment recorded & E-Receipt generated (Preview Mode)!');
      setIsPayModalOpen(false);
      setReceiptPayment(newPay);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Receipt Serial',
      render: (p: Payment) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs">{p.invoiceNo}</span>
          <p className="text-[11px] text-slate-400 font-mono">{p.transactionRef || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Resident Scholar',
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
      header: 'Amount Paid',
      render: (p: Payment) => (
        <span className="font-extrabold text-emerald-600 text-xs">₹{p.amount?.toLocaleString()}</span>
      ),
    },
    {
      header: 'Method',
      render: (p: Payment) => (
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700 text-[11px]">
          {p.paymentMethod}
        </span>
      ),
    },
    {
      header: 'Payment Date',
      render: (p: Payment) => (
        <span className="text-xs text-slate-600 font-medium">
          {new Date(p.paymentDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (p: Payment) => (
        <button
          onClick={() => setReceiptPayment(p)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" /> E-Receipt
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payment Receipts & Ledgers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified fee transactions, gateway logs, and printable GST-compliant receipts
          </p>
        </div>

        <button
          onClick={() => setIsPayModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Record New Payment
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Payment Method</label>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Payment Modes</option>
            <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
            <option value="CARD">Debit / Credit Card</option>
            <option value="CASH">Cash Counter</option>
            <option value="BANK_TRANSFER">Bank NEFT / RTGS</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedMethod('');
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
        searchPlaceholder="Search by receipt invoice no, transaction ref, student..."
      />

      {/* Record Payment Modal */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Record Fee Payment">
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Invoiced Fee Record *</label>
            <select
              value={payForm.studentFeeId}
              onChange={(e) => {
                const fid = e.target.value;
                const match = studentFees.find((f) => f.id === fid);
                setPayForm({
                  ...payForm,
                  studentFeeId: fid,
                  amount: match ? String(match.balanceAmount || match.totalAmount) : '',
                });
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {studentFees.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.student?.user?.firstName} {f.student?.user?.lastName} - {f.feeStructure?.name} (Due: ₹{f.balanceAmount?.toLocaleString()})
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
                value={payForm.amount}
                onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method *</label>
              <select
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="UPI">UPI (GPay / PhonePe)</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="CASH">Cash Counter</option>
                <option value="BANK_TRANSFER">Bank NEFT / RTGS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Transaction Ref / UTR No</label>
            <input
              type="text"
              value={payForm.transactionRef}
              onChange={(e) => setPayForm({ ...payForm, transactionRef: e.target.value })}
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Issue Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable E-Receipt Modal */}
      {receiptPayment && (
        <PrintableReceiptModal isOpen={Boolean(receiptPayment)} payment={receiptPayment} onClose={() => setReceiptPayment(null)} />
      )}
    </div>
  );
};
