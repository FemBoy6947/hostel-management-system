import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  Layers,
  DoorOpen,
  BedDouble,
  UserCheck,
  CreditCard,
  Receipt,
  CalendarCheck2,
  CalendarX,
  UserPlus,
  QrCode,
  AlertCircle,
  Wrench,
  UtensilsCrossed,
  Bell,
  FileBarChart,
  UserCog,
  History,
  Settings,
  X,
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const allNavItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'ACCOUNTANT', 'SECURITY', 'MESS_STAFF', 'MAINTENANCE', 'STUDENT', 'PARENT'],
    },
    {
      name: 'Students',
      path: '/students',
      icon: Users,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'ACCOUNTANT'],
    },
    {
      name: 'Guardians',
      path: '/guardians',
      icon: Shield,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN'],
    },
    {
      name: 'Hostels',
      path: '/hostels',
      icon: Building2,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN'],
    },
    {
      name: 'Floors',
      path: '/floors',
      icon: Layers,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN'],
    },
    {
      name: 'Rooms',
      path: '/rooms',
      icon: DoorOpen,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'MAINTENANCE'],
    },
    {
      name: 'Beds',
      path: '/beds',
      icon: BedDouble,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN'],
    },
    {
      name: 'Room Allocations',
      path: '/allocations',
      icon: UserCheck,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN'],
    },
    {
      name: 'Fee Structures',
      path: '/fees',
      icon: CreditCard,
      roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'STUDENT', 'PARENT'],
    },
    {
      name: 'Payments & Receipts',
      path: '/payments',
      icon: Receipt,
      roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'STUDENT', 'PARENT'],
    },
    {
      name: 'Daily Attendance',
      path: '/attendance',
      icon: CalendarCheck2,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'STUDENT', 'PARENT'],
    },
    {
      name: 'Leave Requests',
      path: '/leaves',
      icon: CalendarX,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'STUDENT', 'PARENT'],
    },
    {
      name: 'Visitor Management',
      path: '/visitors',
      icon: UserPlus,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'SECURITY', 'STUDENT'],
    },
    {
      name: 'Gate Passes',
      path: '/gate-passes',
      icon: QrCode,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'SECURITY', 'STUDENT', 'PARENT'],
    },
    {
      name: 'Complaints',
      path: '/complaints',
      icon: AlertCircle,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'MAINTENANCE', 'STUDENT'],
    },
    {
      name: 'Maintenance Tasks',
      path: '/maintenance',
      icon: Wrench,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'MAINTENANCE'],
    },
    {
      name: 'Mess & Menu',
      path: '/mess',
      icon: UtensilsCrossed,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'MESS_STAFF', 'STUDENT'],
    },
    {
      name: 'Notices',
      path: '/notices',
      icon: Bell,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'ACCOUNTANT', 'SECURITY', 'MESS_STAFF', 'MAINTENANCE', 'STUDENT', 'PARENT'],
    },
    {
      name: 'Reports & Analytics',
      path: '/reports',
      icon: FileBarChart,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'ACCOUNTANT'],
    },
    {
      name: 'User Management',
      path: '/users',
      icon: UserCog,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Audit Logs',
      path: '/audit-logs',
      icon: History,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Settings & Profile',
      path: '/settings',
      icon: Settings,
      roles: ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'ACCOUNTANT', 'SECURITY', 'MESS_STAFF', 'MAINTENANCE', 'STUDENT', 'PARENT'],
    },
  ];

  const currentRole = user?.role || 'STUDENT';
  const visibleNavItems = allNavItems.filter((item) =>
    currentRole === 'SUPER_ADMIN' ? true : item.roles.includes(currentRole as UserRole)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
                HMS <span className="text-brand-400 text-xs font-bold px-1.5 py-0.5 rounded bg-brand-950 border border-brand-800">ERP</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Hostel Enterprise v1.0</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white lg:hidden rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Main Navigation
          </div>

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Role Card at bottom */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'User'}`}
              alt={user?.firstName}
              className="w-9 h-9 rounded-xl object-cover border border-slate-600 bg-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="inline-block text-[10px] font-extrabold text-brand-400 uppercase tracking-wider">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
