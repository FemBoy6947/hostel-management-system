import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleQuickDemo = async (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setLoading(true);
    const success = await login(roleEmail, rolePass);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  const demoPresets = [
    { role: 'Super Admin', email: 'superadmin@hms.edu', pass: 'Admin@123', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { role: 'Hostel Admin', email: 'admin@hms.edu', pass: 'Admin@123', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { role: 'Warden (Boys)', email: 'warden.boys@hms.edu', pass: 'Warden@123', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { role: 'Accountant', email: 'accountant@hms.edu', pass: 'Accountant@123', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { role: 'Security Staff', email: 'security@hms.edu', pass: 'Security@123', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    { role: 'Mess Staff', email: 'mess@hms.edu', pass: 'Mess@123', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { role: 'Maintenance', email: 'maintenance@hms.edu', pass: 'Maintenance@123', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { role: 'Student Resident', email: 'student@hms.edu', pass: 'Student@123', color: 'bg-brand-50 text-brand-700 border-brand-200' },
    { role: 'Parent', email: 'parent@hms.edu', pass: 'Parent@123', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 selection:bg-brand-500 selection:text-white">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side Presentation */}
        <div className="lg:col-span-5 text-white space-y-5 hidden lg:block">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-xl shadow-brand-600/30">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Hostel Management Enterprise ERP</h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              University residential administration system with complete Role-Based Access Control,
              real-time occupancy metrics, automated billing, and student portal.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Full Role-Based Authorization Guards</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Interactive Visual Room Availability Grid</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Downloadable E-Receipts & Reports</span>
            </div>
          </div>
        </div>

        {/* Right Side Login Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In</h3>
              <Link to="/" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                Back to Home
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-1">Enter your credentials or click any demo preset below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hms.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Log In to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Login Chips */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>One-Click Role Demo Logins (Viva & Evaluation)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {demoPresets.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleQuickDemo(demo.email, demo.pass)}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold text-left truncate transition-all hover:scale-[1.02] ${demo.color}`}
                  title={`${demo.role}: ${demo.email}`}
                >
                  {demo.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
