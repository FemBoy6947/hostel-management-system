import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Complaint } from '../types';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Plus, MessageSquare, CheckCircle, Wrench, Loader2 } from 'lucide-react';

export const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [search, setSearch] = useState('');

  // Submit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: 'ROOM',
    priority: 'MEDIUM',
    title: '',
    description: '',
  });

  // Comments / Detail Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  const { success, error } = useToast();
  const { hasRole, user } = useAuth();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus) params.status = selectedStatus;
      if (selectedPriority) params.priority = selectedPriority;
      if (search) params.search = search;
      if (user?.role === 'STUDENT' && user.student) params.studentId = user.student.id;

      const res = await api.get('/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedStatus, selectedPriority, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/complaints', formData);
      if (res.data.success) {
        success('Complaint ticket registered successfully!');
        setIsModalOpen(false);
        setFormData({ category: 'ROOM', priority: 'MEDIUM', title: '', description: '' });
        fetchComplaints();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to register complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const remarks = window.prompt(`Enter resolution remarks:`, 'Inspected and repaired by staff.');
    if (remarks === null) return;
    try {
      const res = await api.put(`/complaints/${id}`, { status, staffRemarks: remarks });
      if (res.data.success) {
        success(`Complaint marked as ${status}`);
        fetchComplaints();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update complaint');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !commentText) return;
    setIsCommentSubmitting(true);
    try {
      const res = await api.post(`/complaints/${selectedComplaint.id}/comments`, { message: commentText });
      if (res.data.success) {
        success('Comment posted');
        setCommentText('');
        // Update local complaint
        const updatedComments = [...(selectedComplaint.comments || []), res.data.data];
        setSelectedComplaint({ ...selectedComplaint, comments: updatedComments });
        fetchComplaints();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Ticket & Category',
      render: (c: Complaint) => (
        <div>
          <p className="font-extrabold text-slate-900 text-xs">{c.ticketNo}</p>
          <span className="text-[10px] text-brand-600 font-bold uppercase">{c.category}</span>
        </div>
      ),
    },
    {
      header: 'Title & Summary',
      render: (c: Complaint) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{c.title}</p>
          <p className="text-slate-500 text-[11px] max-w-xs truncate">{c.description}</p>
        </div>
      ),
    },
    {
      header: 'Scholar & Room',
      render: (c: Complaint) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">
            {c.student?.user?.firstName} {c.student?.user?.lastName}
          </p>
          <span className="text-slate-400 font-mono text-[11px]">{c.hostel?.name || 'Boys Hostel'} (Room {c.room?.roomNumber || '—'})</span>
        </div>
      ),
    },
    {
      header: 'Priority',
      render: (c: Complaint) => (
        <Badge
          variant={
            c.priority === 'CRITICAL' || c.priority === 'HIGH'
              ? 'danger'
              : c.priority === 'MEDIUM'
              ? 'warning'
              : 'neutral'
          }
        >
          {c.priority}
        </Badge>
      ),
    },
    {
      header: 'Status',
      render: (c: Complaint) => (
        <Badge
          variant={
            c.status === 'RESOLVED' || c.status === 'CLOSED'
              ? 'success'
              : c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED'
              ? 'warning'
              : 'danger'
          }
        >
          {c.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (c: Complaint) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedComplaint(c)}
            title="View Details & Comments"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          {hasRole(['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'MAINTENANCE']) && c.status !== 'RESOLVED' && (
            <button
              onClick={() => handleUpdateStatus(c.id, 'RESOLVED')}
              title="Resolve Ticket"
              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Complaint Helpdesk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ticket-based maintenance requests, electrical/plumbing issues, and resolution tracking
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Raise Complaint
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Ticket Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-500 font-semibold mb-1">Priority</label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedStatus('');
              setSelectedPriority('');
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
        data={complaints}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search complaints by title, ticket no, scholar..."
      />

      {/* Raise Complaint Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Maintenance Ticket">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Issue Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="ELECTRICAL">Electrical & Lighting</option>
                <option value="PLUMBING">Plumbing & Water</option>
                <option value="FURNITURE">Furniture / Carpentry</option>
                <option value="INTERNET">Wi-Fi / Network</option>
                <option value="CLEANING">Sanitation & Housekeeping</option>
                <option value="MESS">Mess / Food Quality</option>
                <option value="ROOM">Room Fixture</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Urgency Priority *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical / Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Ticket Subject / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bathroom geyser not turning on"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Explain the issue clearly..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Ticket Details & Discussion Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Ticket #${selectedComplaint.ticketNo} - ${selectedComplaint.title}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={selectedComplaint.priority === 'CRITICAL' ? 'danger' : 'warning'}>
                  {selectedComplaint.priority} PRIORITY
                </Badge>
                <Badge variant={selectedComplaint.status === 'RESOLVED' ? 'success' : 'neutral'}>
                  {selectedComplaint.status}
                </Badge>
              </div>
              <p className="text-slate-800 text-sm">{selectedComplaint.description}</p>
              {selectedComplaint.staffRemarks && (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 mt-2">
                  <span className="font-bold">Staff Resolution Note:</span> {selectedComplaint.staffRemarks}
                </div>
              )}
            </div>

            {/* Comments Thread */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Discussion & Activity Thread</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {selectedComplaint.comments && selectedComplaint.comments.length > 0 ? (
                  selectedComplaint.comments.map((cm: any) => (
                    <div key={cm.id} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{cm.user?.firstName} {cm.user?.lastName} ({cm.user?.role})</span>
                        <span className="text-[10px] text-slate-400">{new Date(cm.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600">{cm.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic py-2">No comments on this ticket yet.</p>
                )}
              </div>

              {/* Add comment box */}
              <form onSubmit={handleAddComment} className="flex gap-2 mt-3">
                <input
                  type="text"
                  required
                  placeholder="Post comment or update..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <button
                  type="submit"
                  disabled={isCommentSubmitting}
                  className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs hover:bg-brand-500"
                >
                  Reply
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
