import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Download, FileBarChart, Layers, CreditCard, Printer, TrendingUp, Users } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export const ReportsPage: React.FC = () => {
  const [occupancyReport, setOccupancyReport] = useState<any[]>([]);
  const [financialReport, setFinancialReport] = useState<any>(null);
  const [activeReportTab, setActiveReportTab] = useState<'occupancy' | 'financial'>('occupancy');
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [occRes, finRes] = await Promise.all([
        api.get('/reports/occupancy'),
        api.get('/reports/financial'),
      ]);

      if (occRes.data.success) setOccupancyReport(occRes.data.data);
      if (finRes.data.success) setFinancialReport(finRes.data);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to generate reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reports & Analytics Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational summaries, hostel occupancy audits, and financial ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Report
          </button>
        </div>
      </div>

      {/* CSV Export Quick Buttons */}
      <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
            <Download className="w-5 h-5 text-brand-400" /> Export Official CSV Master Datasets
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Directly download raw spreadsheet data for administration auditing</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="http://localhost:5000/api/reports/export/students"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors"
          >
            Students CSV
          </a>
          <a
            href="http://localhost:5000/api/reports/export/payments"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-colors"
          >
            Payments CSV
          </a>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveReportTab('occupancy')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeReportTab === 'occupancy'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" /> Hostel Occupancy Report
        </button>
        <button
          onClick={() => setActiveReportTab('financial')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeReportTab === 'financial'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Revenue & Collection Report
        </button>
      </div>

      {/* Occupancy Report */}
      {activeReportTab === 'occupancy' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Hostel Occupancy Audit Matrix</h3>
            <p className="text-xs text-slate-400">Total room capacity, beds filled, and active utilization rate</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 font-semibold text-slate-500 uppercase">
                  <th className="py-3 px-4">Hostel Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Total Rooms</th>
                  <th className="py-3 px-4">Total Beds</th>
                  <th className="py-3 px-4">Occupied</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4">Occupancy Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {occupancyReport.map((h) => (
                  <tr key={h.hostelId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{h.hostelName}</td>
                    <td className="py-3 px-4 font-mono">{h.code}</td>
                    <td className="py-3 px-4 font-semibold text-brand-600">{h.type}</td>
                    <td className="py-3 px-4">{h.totalRooms}</td>
                    <td className="py-3 px-4 font-bold">{h.totalBeds}</td>
                    <td className="py-3 px-4 font-bold text-rose-600">{h.occupiedBeds}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{h.availableBeds}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{h.occupancyRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Report */}
      {activeReportTab === 'financial' && financialReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-xs">
              <span className="text-slate-400 font-bold">Total Invoiced Amount</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                ₹{financialReport.summary?.totalInvoiced?.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-xs">
              <span className="text-emerald-600 font-bold">Total Collected Revenue</span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                ₹{financialReport.summary?.totalCollected?.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Collection Rate: {financialReport.summary?.collectionRate}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-xs">
              <span className="text-amber-600 font-bold">Total Outstanding Due</span>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">
                ₹{financialReport.summary?.totalPending?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Collections by Payment Channel</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-bold">UPI / GPay</span>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  ₹{financialReport.summary?.paymentMethodStats?.UPI?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-bold">Credit/Debit Card</span>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  ₹{financialReport.summary?.paymentMethodStats?.CARD?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-bold">Cash Counter</span>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  ₹{financialReport.summary?.paymentMethodStats?.CASH?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-bold">Bank Transfer</span>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  ₹{financialReport.summary?.paymentMethodStats?.BANK_TRANSFER?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
