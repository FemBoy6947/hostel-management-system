import React from 'react';
import { Payment } from '../types';
import { Modal } from './Modal';
import { Printer, Download, CheckCircle, Building2 } from 'lucide-react';

interface PrintableReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const student = payment.student;
  const activeAlloc = student?.allocations && student?.allocations[0];
  const feeStructure = payment.studentFee?.feeStructure;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Payment Receipt #${payment.invoiceNo}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Printable Area Container */}
        <div
          id="printable-receipt"
          className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6 text-slate-800"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-600 text-white rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  UNIVERSITY HOSTEL MANAGEMENT
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Official E-Receipt & Payment Acknowledgement
                </p>
                <p className="text-[11px] text-slate-400">
                  Campus Main Block, Innovation Way, Tech City
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" /> PAID
              </span>
              <p className="text-xs font-bold text-slate-900 mt-2">{payment.invoiceNo}</p>
              <p className="text-xs text-slate-500">
                {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Student & Payment Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Student Particulars
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {student?.user?.firstName} {student?.user?.lastName}
              </p>
              <p className="text-slate-600">Enrollment No: <span className="font-medium text-slate-800">{student?.enrollmentNo}</span></p>
              <p className="text-slate-600">Course & Dept: <span className="font-medium text-slate-800">{student?.course} - {student?.department}</span></p>
              <p className="text-slate-600">
                Hostel Allotment: <span className="font-medium text-slate-800">{activeAlloc?.hostel?.name || 'Assigned Hostel'} (Room {activeAlloc?.room?.roomNumber || '—'})</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Transaction Details
              </span>
              <p className="text-slate-600">Payment Mode: <span className="font-bold text-slate-900">{payment.paymentMethod}</span></p>
              <p className="text-slate-600">Reference / Ref ID: <span className="font-mono text-slate-800">{payment.transactionRef || 'N/A'}</span></p>
              <p className="text-slate-600">Fee Scheme: <span className="font-medium text-slate-800">{feeStructure?.name || 'Semester Fee'}</span></p>
              <p className="text-slate-600">Received By: <span className="font-medium text-slate-800">{payment.receivedBy?.firstName || 'Accounts Officer'}</span></p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="p-3">Description / Fee Head</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3">Hostel Accommodation & Utility Fee</td>
                  <td className="p-3 text-right">₹{feeStructure?.hostelFee?.toLocaleString() || '30,000'}</td>
                </tr>
                <tr>
                  <td className="p-3">Mess & Food Service Charges</td>
                  <td className="p-3 text-right">₹{feeStructure?.messFee?.toLocaleString() || '20,000'}</td>
                </tr>
                <tr>
                  <td className="p-3">Hostel Amenities & Maintenance Levy</td>
                  <td className="p-3 text-right">₹{feeStructure?.maintenanceFee?.toLocaleString() || '3,000'}</td>
                </tr>
                <tr>
                  <td className="p-3">Refundable Security Deposit</td>
                  <td className="p-3 text-right">₹{feeStructure?.securityDeposit?.toLocaleString() || '5,000'}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50 font-bold text-slate-900">
                  <td className="p-3">Total Amount Paid in this Receipt</td>
                  <td className="p-3 text-right text-base text-emerald-600">
                    ₹{payment.amount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer & Signature */}
          <div className="flex items-end justify-between pt-6 border-t border-slate-200 text-xs text-slate-400">
            <div>
              <p className="text-[11px]">This is a computer generated receipt. No physical signature required.</p>
              <p className="text-[10px] text-slate-400 mt-1">Generated by Hostel Management System (HMS ERP v1.0)</p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-dashed border-slate-400 mb-1"></div>
              <span className="text-[11px] font-bold text-slate-600">Accounts Department</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>
    </Modal>
  );
};
