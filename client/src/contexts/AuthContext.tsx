import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, UserRole } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<boolean>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pre-configured demo user profiles for seamless standalone preview
const DEMO_USERS: Record<string, User> = {
  'superadmin@hms.edu': {
    id: 'user-superadmin-01',
    email: 'superadmin@hms.edu',
    firstName: 'Alexander',
    lastName: 'Vance',
    role: 'SUPER_ADMIN',
    isActive: true,
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  'admin@hms.edu': {
    id: 'user-admin-01',
    email: 'admin@hms.edu',
    firstName: 'Eleanor',
    lastName: 'Rigby',
    role: 'ADMIN',
    isActive: true,
    phone: '+91 98765 11223',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  'warden.boys@hms.edu': {
    id: 'user-warden-01',
    email: 'warden.boys@hms.edu',
    firstName: 'Robert',
    lastName: 'Langdon',
    role: 'WARDEN',
    isActive: true,
    phone: '+91 98765 22334',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  'warden.girls@hms.edu': {
    id: 'user-warden-02',
    email: 'warden.girls@hms.edu',
    firstName: 'Sarah',
    lastName: 'Connor',
    role: 'WARDEN',
    isActive: true,
    phone: '+91 98765 33445',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  'accountant@hms.edu': {
    id: 'user-acc-01',
    email: 'accountant@hms.edu',
    firstName: 'Arthur',
    lastName: 'Dent',
    role: 'ACCOUNTANT',
    isActive: true,
    phone: '+91 98765 44556',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  'security@hms.edu': {
    id: 'user-sec-01',
    email: 'security@hms.edu',
    firstName: 'Marcus',
    lastName: 'Fenix',
    role: 'SECURITY',
    isActive: true,
    phone: '+91 98765 55667',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  'mess@hms.edu': {
    id: 'user-mess-01',
    email: 'mess@hms.edu',
    firstName: 'Gordon',
    lastName: 'Ramsay',
    role: 'MESS_STAFF',
    isActive: true,
    phone: '+91 98765 66778',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  'maintenance@hms.edu': {
    id: 'user-maint-01',
    email: 'maintenance@hms.edu',
    firstName: 'Bob',
    lastName: 'Builder',
    role: 'MAINTENANCE',
    isActive: true,
    phone: '+91 98765 77889',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  'student@hms.edu': {
    id: 'user-stud-01',
    email: 'student@hms.edu',
    firstName: 'Aarav',
    lastName: 'Sharma',
    role: 'STUDENT',
    isActive: true,
    phone: '+91 98765 88990',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  'parent@hms.edu': {
    id: 'user-parent-01',
    email: 'parent@hms.edu',
    firstName: 'Rajesh',
    lastName: 'Sharma',
    role: 'PARENT',
    isActive: true,
    phone: '+91 98765 99001',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
};

const DEFAULT_INITIAL_USER = DEMO_USERS['superadmin@hms.edu'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('hms_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return DEFAULT_INITIAL_USER;
      }
    }
    // Auto-login as Super Admin on first launch so all data is instantly accessible
    localStorage.setItem('hms_user', JSON.stringify(DEFAULT_INITIAL_USER));
    localStorage.setItem('hms_access_token', 'demo_jwt_token_superadmin');
    return DEFAULT_INITIAL_USER;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const { success, error } = useToast();

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('hms_access_token');
    if (!token) return;

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('hms_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      // In offline/static mode, preserve current demo user
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();

    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password });
      if (res.data.success) {
        localStorage.setItem('hms_access_token', res.data.accessToken);
        localStorage.setItem('hms_refresh_token', res.data.refreshToken);
        localStorage.setItem('hms_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        success(`Welcome back, ${res.data.user.firstName}!`);
        return true;
      }
      return false;
    } catch (err: any) {
      const demoUser = DEMO_USERS[cleanEmail];
      if (demoUser) {
        const dummyToken = `demo_jwt_token_${demoUser.role}_${Date.now()}`;
        localStorage.setItem('hms_access_token', dummyToken);
        localStorage.setItem('hms_refresh_token', dummyToken);
        localStorage.setItem('hms_user', JSON.stringify(demoUser));
        setUser(demoUser);
        success(`Welcome, ${demoUser.firstName} (${demoUser.role.replace('_', ' ')})!`);
        return true;
      }

      const msg = err.response?.data?.message || 'Invalid credentials. Please use demo account.';
      error(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('hms_access_token');
    localStorage.removeItem('hms_refresh_token');
    localStorage.removeItem('hms_user');
    setUser(DEFAULT_INITIAL_USER);
    success('Reset to demo session.');
    window.location.href = '/dashboard';
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  // One-click demo role switcher for quick evaluator/viva testing
  const switchDemoRole = async (role: UserRole): Promise<boolean> => {
    const demoAccounts: Record<UserRole, { email: string; pass: string }> = {
      SUPER_ADMIN: { email: 'superadmin@hms.edu', pass: 'Admin@123' },
      ADMIN: { email: 'admin@hms.edu', pass: 'Admin@123' },
      WARDEN: { email: 'warden.boys@hms.edu', pass: 'Warden@123' },
      ACCOUNTANT: { email: 'accountant@hms.edu', pass: 'Accountant@123' },
      SECURITY: { email: 'security@hms.edu', pass: 'Security@123' },
      MESS_STAFF: { email: 'mess@hms.edu', pass: 'Mess@123' },
      MAINTENANCE: { email: 'maintenance@hms.edu', pass: 'Maintenance@123' },
      STUDENT: { email: 'student@hms.edu', pass: 'Student@123' },
      PARENT: { email: 'parent@hms.edu', pass: 'Parent@123' },
    };

    const target = demoAccounts[role];
    if (target) {
      const result = await login(target.email, target.pass);
      return result;
    }
    return false;
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        switchDemoRole,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
