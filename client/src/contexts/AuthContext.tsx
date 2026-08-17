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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('hms_access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('hms_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
      localStorage.removeItem('hms_access_token');
      localStorage.removeItem('hms_refresh_token');
      localStorage.removeItem('hms_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password });
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
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      error(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('hms_access_token');
    localStorage.removeItem('hms_refresh_token');
    localStorage.removeItem('hms_user');
    setUser(null);
    success('Logged out successfully.');
    window.location.href = '/login';
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
