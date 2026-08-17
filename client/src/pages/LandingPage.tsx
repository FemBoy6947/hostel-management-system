import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Users,
  CreditCard,
  QrCode,
  UtensilsCrossed,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  BarChart3,
  CalendarCheck,
  Bell,
  Cpu,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                HMS <span className="text-brand-400 font-bold text-sm px-2 py-0.5 rounded-full bg-brand-950/80 border border-brand-800">ERP</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Enterprise Campus Residence Management</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-brand-400 transition-colors">Features</a>
            <a href="#roles" className="hover:text-brand-400 transition-colors">User Roles</a>
            <a href="#architecture" className="hover:text-brand-400 transition-colors">Architecture</a>
            <a href="#faq" className="hover:text-brand-400 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/20 transition-all flex items-center gap-2"
            >
              Live Demo Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,197,94,0.15),rgba(255,255,255,0))]"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-950/80 border border-brand-800 text-brand-300 text-xs font-bold shadow-inner">
            <Sparkles className="w-4 h-4 text-brand-400" />
            Production-Style University ERP & Hostel Automation System
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Intelligent, Secure & Full-Stack <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-200">
              Hostel Management ERP
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            A comprehensive, multi-role campus housing platform built with React, Node.js REST API,
            Prisma ORM, and Relational Database. Designed for universities, halls of residence, and modern student housing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-2xl shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              Explore Live System
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="http://localhost:5000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Interactive Swagger API Docs
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 text-left">
            {[
              { label: 'Role-Based Access', value: '9 Distinct Roles', sub: 'Super Admin down to Parent' },
              { label: 'Database Schema', value: '27 Relational Tables', sub: 'Prisma ORM + PostgreSQL' },
              { label: 'Security & Auth', value: 'JWT + Refresh Tokens', sub: 'Bcrypt Hashed Passwords' },
              { label: 'Ready for Viva', value: '100% Seed Data', sub: 'Pre-populated Students & Rooms' },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 backdrop-blur-sm">
                <span className="text-xs text-brand-400 font-bold uppercase tracking-wider">{stat.label}</span>
                <h3 className="text-xl font-extrabold text-white mt-1">{stat.value}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Room Grid & Features Highlight */}
      <section id="features" className="py-20 px-6 bg-slate-950/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-brand-400 uppercase tracking-wider">
              Core Modules & Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Complete Operational Control
            </h2>
            <p className="text-sm text-slate-400">
              Every workflow has been designed from the ground up to replace paper logs and manual spreadsheets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: 'Visual Room & Bed Allocation',
                desc: 'Color-coded room status grid (Green, Yellow, Red, Gray) with strict non-duplicate bed allocation enforcement.',
              },
              {
                icon: CreditCard,
                title: 'Fee Invoicing & Payment Receipts',
                desc: 'Itemized semester billing, online & offline payment recording, automatic balance updates, and printable e-receipts.',
              },
              {
                icon: CalendarCheck,
                title: 'Daily Attendance & Leave Workflow',
                desc: 'Hostel-wise bulk attendance marking, student leave applications, and Warden approval management.',
              },
              {
                icon: QrCode,
                title: 'Digital Gate Passes & QR Codes',
                desc: 'Automated curfew tracking, digital pass numbers, and security desk checkout / check-in timestamps.',
              },
              {
                icon: Wrench,
                title: 'Helpdesk Tickets & Maintenance',
                desc: 'Complaint ticketing with priority levels, staff assignment, comment trails, and maintenance cost logging.',
              },
              {
                icon: UtensilsCrossed,
                title: 'Mess Menus & Nutritional Data',
                desc: 'Weekly meal planning for Breakfast, Lunch, Snacks, and Dinner with calorie tracking and special item highlights.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-950 border border-brand-800/80 text-brand-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9 User Roles Matrix */}
      <section id="roles" className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-brand-400 uppercase tracking-wider">
              Role-Based Access Control (RBAC)
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tailored Experiences Across 9 Distinct Roles
            </h2>
            <p className="text-sm text-slate-400">
              Each user persona accesses only the screens and REST APIs they are explicitly authorized for.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { role: 'Super Admin', desc: 'Unrestricted system control, database operations, user management, and audit logs.', color: 'border-purple-500/40 bg-purple-950/20' },
              { role: 'Hostel Admin', desc: 'Hostel configurations, floor layouts, student admission, room master, and reports.', color: 'border-blue-500/40 bg-blue-950/20' },
              { role: 'Warden', desc: 'Hostel floor supervision, student discipline, leave approvals, attendance, and complaints.', color: 'border-emerald-500/40 bg-emerald-950/20' },
              { role: 'Accountant', desc: 'Fee structures, student fee assignment, receipt generation, and revenue reports.', color: 'border-amber-500/40 bg-amber-950/20' },
              { role: 'Security Staff', desc: 'Visitor desk check-in/out, student gate pass verification, and live inside count.', color: 'border-sky-500/40 bg-sky-950/20' },
              { role: 'Mess Staff', desc: 'Weekly food menus, meal attendance records, and mess notice broadcasts.', color: 'border-orange-500/40 bg-orange-950/20' },
              { role: 'Maintenance Staff', desc: 'Assigned maintenance tasks, electrical/plumbing repairs, and expense logs.', color: 'border-indigo-500/40 bg-indigo-950/20' },
              { role: 'Student', desc: 'Personal room details, fee invoices, payment receipts, leave & gate pass applications.', color: 'border-brand-500/40 bg-brand-950/20' },
              { role: 'Parent / Guardian', desc: 'Ward attendance metrics, fee payment status, gate passes, and emergency contact link.', color: 'border-rose-500/40 bg-rose-950/20' },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${item.color} backdrop-blur-sm space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-base">{item.role}</h4>
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture & Tech Stack */}
      <section id="architecture" className="py-20 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-brand-400 uppercase tracking-wider">
              Tech Stack & Engineering
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Production-Ready Engineering Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-400" /> Frontend Layer
              </h4>
              <ul className="space-y-1.5 text-slate-400 font-medium">
                <li>• React.js with TypeScript</li>
                <li>• Tailwind CSS & Custom Theme</li>
                <li>• React Router DOM v6</li>
                <li>• Recharts Analytics Engine</li>
                <li>• Lucide Modern Icons</li>
                <li>• Printable Receipt Generator</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" /> Backend API Layer
              </h4>
              <ul className="space-y-1.5 text-slate-400 font-medium">
                <li>• Node.js & Express.js (TS)</li>
                <li>• RESTful API Architecture</li>
                <li>• Swagger / OpenAPI 3.0 Docs</li>
                <li>• Express Rate Limiting</li>
                <li>• Centralized Error Middleware</li>
                <li>• Dynamic CSV Report Export</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-400" /> Database & ORM
              </h4>
              <ul className="space-y-1.5 text-slate-400 font-medium">
                <li>• Prisma ORM</li>
                <li>• 27 Relational Tables</li>
                <li>• Cascade Foreign Key Deletes</li>
                <li>• Zero-Conflict Bed Allocation Rules</li>
                <li>• Automatic Master Seed Script</li>
                <li>• Postgres / Docker Support</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-400" /> Security & Auditing
              </h4>
              <ul className="space-y-1.5 text-slate-400 font-medium">
                <li>• JWT Access & Refresh Tokens</li>
                <li>• Bcrypt Password Hashing</li>
                <li>• Role-Based Guard Middleware</li>
                <li>• Immutable System Audit Trail</li>
                <li>• HTTP Helmet Headers & CORS</li>
                <li>• Input Validation & Sanitization</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-slate-800 bg-slate-950 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
            H
          </div>
          <span className="font-extrabold text-white text-sm">Hostel Management System (HMS) ERP</span>
        </div>
        <p className="text-xs text-slate-500">
          Developed as an Enterprise Full-Stack Final Year IT Project & College ERP Platform.
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-md"
          >
            Launch System Demo
          </Link>
        </div>
      </footer>
    </div>
  );
};
