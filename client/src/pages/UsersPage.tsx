import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, UserRole } from '../types';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { UserCog, Plus, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'WARDEN' as UserRole,
  });

  const { success, error } = useToast();
  const { hasRole } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedRole) params.role = selectedRole;
      if (search) params.search = search;

      const res = await api.get('/users', { params });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, search]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/users', formData);
      if (res.data.success) {
        success('Staff user created successfully!');
        setIsModalOpen(false);
        setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'WARDEN' });
        fetchUsers();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userObj: User) => {
    try {
      const res = await api.put(`/users/${userObj.id}`, { isActive: !userObj.isActive });
      if (res.data.success) {
        success(`User ${userObj.firstName} status updated`);
        fetchUsers();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const columns = [
    {
      header: 'User Profile',
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <img
            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`}
            alt={u.firstName}
            className="w-8 h-8 rounded-xl object-cover border border-slate-200 bg-slate-100"
          />
          <div>
            <p className="font-bold text-slate-900 text-xs">
              {u.firstName} {u.lastName}
            </p>
            <span className="text-[11px] text-slate-400">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      render: (u: User) => (
        <Badge variant={u.role === 'SUPER_ADMIN' ? 'danger' : u.role === 'ADMIN' ? 'warning' : 'primary'}>
          {u.role.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Contact Phone',
      accessor: 'phone',
    },
    {
      header: 'Last Login',
      render: (u: User) => (
        <span className="text-xs text-slate-500">
          {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never logged in'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (u: User) => (
        <Badge variant={u.isActive ? 'success' : 'danger'}>
          {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
        </Badge>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (u: User) => {
        if (!hasRole(['SUPER_ADMIN'])) return null;
        return (
          <button
            onClick={() => handleToggleStatus(u)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              u.isActive
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {u.isActive ? 'Deactivate' : 'Activate'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Administration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            System accounts, RBAC role assignments, and account activation controls
          </p>
        </div>

        {hasRole(['SUPER_ADMIN', 'ADMIN']) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Create User Account
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Filter by Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">SUPER ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="WARDEN">WARDEN</option>
            <option value="ACCOUNTANT">ACCOUNTANT</option>
            <option value="SECURITY">SECURITY</option>
            <option value="MESS_STAFF">MESS STAFF</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="STUDENT">STUDENT</option>
            <option value="PARENT">PARENT</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedRole('');
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
        data={users}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users by name, email..."
      />

      {/* Create User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create User Account">
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Temporary Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Hostel Admin</option>
                <option value="WARDEN">Hostel Warden</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="SECURITY">Security Staff</option>
                <option value="MESS_STAFF">Mess Staff</option>
                <option value="MAINTENANCE">Maintenance Staff</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
