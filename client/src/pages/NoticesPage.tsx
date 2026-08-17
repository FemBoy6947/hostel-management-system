import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Notice } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Plus, Pin, Trash2, Calendar, Users, Loader2 } from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudience, setSelectedAudience] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    targetAudience: 'ALL',
    isPinned: false,
  });

  const { success, error } = useToast();
  const { hasRole } = useAuth();

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedAudience) params.targetAudience = selectedAudience;

      const res = await api.get('/notices', { params });
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [selectedAudience]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/notices', formData);
      if (res.data.success) {
        success('Notice published successfully!');
        setIsModalOpen(false);
        setFormData({ title: '', content: '', category: 'GENERAL', priority: 'NORMAL', targetAudience: 'ALL', isPinned: false });
        fetchNotices();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this announcement bulletin?')) return;
    try {
      const res = await api.delete(`/notices/${id}`);
      if (res.data.success) {
        success('Notice deleted');
        fetchNotices();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete notice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notices & Circulars</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official announcements, cultural fest schedules, and hostel administrative circulars
          </p>
        </div>

        {hasRole(['SUPER_ADMIN', 'ADMIN', 'WARDEN']) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Publish Announcement
          </button>
        )}
      </div>

      {/* Filter by Target Audience */}
      <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <label className="font-bold text-slate-700">Target Audience:</label>
        <select
          value={selectedAudience}
          onChange={(e) => setSelectedAudience(e.target.value)}
          className="p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
        >
          <option value="">All Circulars</option>
          <option value="ALL">Everyone (ALL)</option>
          <option value="HOSTEL">Hostel Residents Only</option>
          <option value="STAFF">Staff & Faculty Only</option>
          <option value="PARENTS">Parents Only</option>
        </select>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.map((n) => (
          <div
            key={n.id}
            className={`p-6 rounded-3xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 ${
              n.isPinned ? 'bg-amber-50/30 border-amber-200' : 'bg-white border-slate-200/80'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {n.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-extrabold rounded-full">
                      <Pin className="w-3 h-3" /> PINNED
                    </span>
                  )}
                  <Badge variant={n.category === 'URGENT' || n.priority === 'HIGH' ? 'danger' : 'neutral'}>
                    {n.category}
                  </Badge>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                    Audience: {n.targetAudience}
                  </span>
                </div>

                {hasRole(['SUPER_ADMIN', 'ADMIN', 'WARDEN']) && (
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{n.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2 whitespace-pre-line">{n.content}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Published: {new Date(n.publishDate).toLocaleDateString()}
              </span>
              <span className="font-medium text-slate-600">By: {n.createdBy?.firstName || 'Hostel Admin'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish Official Circular">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Hostel Cultural Fest 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="GENERAL">General</option>
                <option value="ACADEMIC">Academic</option>
                <option value="MESS">Mess & Food</option>
                <option value="EVENT">Cultural / Sports Event</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="URGENT">Urgent Circular</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="ALL">All Campus (Everyone)</option>
                <option value="HOSTEL">Hostel Residents</option>
                <option value="STAFF">Staff & Wardens</option>
                <option value="PARENTS">Parents & Guardians</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Circular Content *</label>
            <textarea
              required
              rows={4}
              placeholder="Write the full circular notice..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isPinned" className="font-bold text-slate-700">
              Pin this circular to top of bulletin board
            </label>
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Circular'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
