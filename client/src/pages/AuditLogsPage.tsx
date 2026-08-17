import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AuditLog } from '../types';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { useToast } from '../contexts/ToastContext';
import { History, Shield, Laptop, Clock } from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '../services/mockData';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');
  const [search, setSearch] = useState('');
  const { error } = useToast();

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedModule) params.module = selectedModule;
      if (search) params.search = search;

      const res = await api.get('/audit-logs', { params });
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        setLogs(res.data.data);
      } else {
        let filtered = MOCK_AUDIT_LOGS;
        if (selectedModule) filtered = filtered.filter(l => l.module === selectedModule);
        setLogs(filtered);
      }
    } catch (err: any) {
      setLogs(MOCK_AUDIT_LOGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [selectedModule, search]);

  const columns = [
    {
      header: 'Timestamp',
      render: (log: AuditLog) => (
        <div className="text-xs text-slate-500 font-mono">
          {new Date(log.createdAt).toLocaleString()}
        </div>
      ),
    },
    {
      header: 'User Account',
      render: (log: AuditLog) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{log.userEmail || 'System Process'}</p>
          <span className="text-[10px] text-brand-600 font-extrabold uppercase">
            {log.userRole || 'SYSTEM'}
          </span>
        </div>
      ),
    },
    {
      header: 'Action & Module',
      render: (log: AuditLog) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              log.action.includes('CREATE') || log.action.includes('ALLOCAT') || log.action.includes('PAYMENT')
                ? 'success'
                : log.action.includes('UPDATE') || log.action.includes('APPROV')
                ? 'info'
                : log.action.includes('DELETE') || log.action.includes('REJECT')
                ? 'danger'
                : 'neutral'
            }
          >
            {log.action}
          </Badge>
          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold text-slate-700">
            {log.module}
          </span>
        </div>
      ),
    },
    {
      header: 'Operation Details',
      render: (log: AuditLog) => (
        <p className="text-xs text-slate-700 max-w-sm truncate" title={log.details || ''}>
          {log.details || '—'}
        </p>
      ),
    },
    {
      header: 'IP Address',
      render: (log: AuditLog) => (
        <span className="text-xs text-slate-400 font-mono">{log.ipAddress || '192.168.1.1'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Audit Trail</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable administrative event logging, user access trails, and operation history
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Module Area</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Modules</option>
            <option value="AUTH">AUTH & SESSIONS</option>
            <option value="STUDENTS">STUDENTS</option>
            <option value="ROOMS">ROOMS & BEDS</option>
            <option value="ALLOCATIONS">ALLOCATIONS</option>
            <option value="FINANCE">FEES & PAYMENTS</option>
            <option value="ATTENDANCE">ATTENDANCE</option>
            <option value="LEAVES">LEAVES</option>
            <option value="GATE_PASS">GATE PASSES</option>
            <option value="VISITORS">VISITORS</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="NOTICES">NOTICES</option>
            <option value="USERS">USERS</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedModule('');
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
        data={logs}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search audit events by user email, action, details..."
      />
    </div>
  );
};
