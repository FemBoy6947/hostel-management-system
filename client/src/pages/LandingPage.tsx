import React, { useState } from 'react';
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
  ChevronDown,
  Check,
  Activity,
  Zap,
  Award,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeRoleTab, setActiveRoleTab] = useState<string>('SUPER_ADMIN');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const rolePreviews: Record<string, { title: string; badge: string; desc: string; stats: string[]; features: string[]; loginRole: string }> = {
    SUPER_ADMIN: {
      title: 'Super Administrator',
      badge: 'Level 1 Master Access',
      desc: 'Complete high-level command center with full database control, user administration, system logs, and institute-wide reporting.',
      stats: ['3 Hostels Configured', '9 Active Roles', '100% Audit Logging'],
      features: ['Create & Deactivate Staff Accounts', 'Real-time System Audit Trail', 'Global Occupancy Analytics', 'Database Master Overrides'],
      loginRole: 'SUPER_ADMIN',
    },
    WARDEN: {
      title: 'Hostel Warden',
      badge: 'Residential Supervision',
      desc: 'Day-to-day discipline management, floor roll-calls, night leave approvals, room allotments, and resident student grievance tracking.',
      stats: ['104 Monitored Beds', '96% Daily Attendance', '24/7 Night Outing Logs'],
      features: ['Daily Roll-Call Marking', 'Leave & Night Out Approvals', 'Bed Allocations & Room Transfers', 'Complaint Resolution Desk'],
      loginRole: 'WARDEN',
    },
    ACCOUNTANT: {
      title: 'Finance & Accounts Officer',
      badge: 'Billing & Ledgers',
      desc: 'Semester fee structures, student fee assignments, scholarship waivers, payment ledgers, and printable GST-compliant receipts.',
      stats: ['₹12,50,000+ Invoiced', 'Instant UPI / Cash Slips', 'Auto Balance Calc'],
      features: ['Automated Fee Structure Generation', 'Payment Gateway & Cash Logging', 'Printable PDF Receipts', 'Financial Revenue Auditing'],
      loginRole: 'ACCOUNTANT',
    },
    SECURITY: {
      title: 'Campus Security Desk',
      badge: 'Access & Gate Control',
      desc: 'Digital gate pass scanning, QR code verification, visitor logbook with Aadhaar identification, and live inside-campus counts.',
      stats: ['QR Scan Verification', 'Real-time Curfew Watch', 'Digital Visitor Records'],
      features: ['QR Code Gate Pass Checkout/Return', 'Visitor Aadhaar Verification', 'Live Outside-Campus Student List', 'Emergency Alert Dispatch'],
      loginRole: 'SECURITY',
    },
    STUDENT: {
      title: 'Resident Scholar',
      badge: 'Student Self-Service Portal',
      desc: 'Personal hostel room overview, digital fee payment receipts, gate pass applications, leave requests, and mess menus.',
      stats: ['Assigned Room 201-A', 'Fee Dues: ₹0 Cleared', 'Active Outing Pass'],
      features: ['My Room & Roommate Details', 'Instant Fee Clearance Receipts', 'Apply for Digital Gate Pass & Leaves', 'Daily 4-Meal Mess Schedule'],
      loginRole: 'STUDENT',
    },
  };

  const currentPreview = rolePreviews[activeRoleTab];

  const faqs = [
    {
      q: 'How does the Visual Room Allocation System prevent double-booking?',
      a: 'The system implements strict database-level unique constraints and atomic Prisma transactions. An active student cannot hold multiple active bed allocations simultaneously, and individual beds transition between AVAILABLE, OCCUPIED, and MAINTENANCE states with color-coded visual mapping.',
    },
    {
      q: 'What payment methods are supported for hostel fee clearance?',
      a: 'Students and Accountants can record payments via UPI (GPay/PhonePe/Paytm), Credit/Debit Cards, Cash counters, and Bank NEFT/RTGS transfers with auto-generated receipt serial numbers and printable vouchers.',
    },
    {
      q: 'How does the digital Gate Pass system work for security guards?',
      a: 'Students generate digital gate passes with outgoing reasons and expected return times. Wardens approve passes from their portal, and Security Staff scan or verify the Pass ID at the gate to log instant check-out and check-in timestamps.',
    },
    {
      q: 'What technology stack powers this ERP?',
      a: 'Frontend: React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons. Backend: Node.js, Express REST API, JWT Authentication with Refresh Tokens, Helmet security, Prisma ORM with 27 relational database tables.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                HMS <span className="text-brand-400 font-bold text-xs px-2 py-0.5 rounded-full bg-brand-950/80 border border-brand-800">ENTERPRISE ERP</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Autonomous Campus Residence & Student Housing Platform</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#demo-preview" className="hover:text-brand-400 transition-colors">Live Preview</a>
            <a href="#features" className="hover:text-brand-400 transition-colors">Core Modules</a>
            <a href="#roles" className="hover:text-brand-400 transition-colors">9 Roles Matrix</a>
            <a href="#architecture" className="hover:text-brand-400 transition-colors">Tech Architecture</a>
            <a href="#faq" className="hover:text-brand-400 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 rounded-xl shadow-lg shadow-brand-600/20 transition-all flex items-center gap-2"
            >
              Open Live ERP Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,197,94,0.18),rgba(255,255,255,0))]"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-950/90 border border-brand-700/80 text-brand-300 text-xs font-bold shadow-inner">
            <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
            Next-Gen Autonomous University Living & Student Housing Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Autonomous, Secure & Intelligent <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
              Hostel Management ERP
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
            A real-world, production-ready campus housing operating system built with React, Node.js REST API,
            Prisma ORM, and Relational Database. Powers visual room availability mapping, digital QR gate passes,
            itemized fee invoicing, nightly attendance roll-calls, and audit trails.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 rounded-2xl shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              <Zap className="w-4 h-4" />
              Launch Live Portal Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#demo-preview"
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Explore Interactive Role Demo
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-left">
            {[
              { label: 'Role Security', value: '9 RBAC Roles', sub: 'Super Admin to Parent' },
              { label: 'Database Models', value: '27 Relational Tables', sub: 'Prisma ORM Architecture' },
              { label: 'Digital Gate Passes', value: 'Instant QR Outing', sub: 'Security Desk Scanning' },
              { label: 'Pre-Seeded Data', value: '50+ Scholars & Rooms', sub: 'Ready for Live Viva' },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm hover:border-brand-500/40 transition-colors">
                <span className="text-xs text-brand-400 font-bold uppercase tracking-wider">{stat.label}</span>
                <h3 className="text-xl font-extrabold text-white mt-1">{stat.value}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Role Showcase Preview */}
      <section id="demo-preview" className="py-16 px-6 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-brand-400 uppercase tracking-wider">
              Interactive System Simulator
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Experience the ERP Across Every Perspective
            </h2>
            <p className="text-xs text-slate-400">
              Click any user role below to preview their specialized dashboard capabilities and workflows.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'SUPER_ADMIN', name: 'Super Admin', icon: '👑' },
              { id: 'WARDEN', name: 'Hostel Warden', icon: '🧑‍💼' },
              { id: 'ACCOUNTANT', name: 'Accountant', icon: '💰' },
              { id: 'SECURITY', name: 'Security Staff', icon: '🛡️' },
              { id: 'STUDENT', name: 'Student Resident', icon: '🎓' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRoleTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeRoleTab === tab.id
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span> {tab.name}
              </button>
            ))}
          </div>

          {/* Active Preview Showcase Card */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="px-3 py-1 rounded-full bg-brand-950 border border-brand-700 text-brand-400 text-[11px] font-extrabold uppercase tracking-wide">
                  {currentPreview.badge}
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-2">{currentPreview.title}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">{currentPreview.desc}</p>
              </div>

              <Link
                to="/dashboard"
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start md:self-auto"
              >
                1-Click Demo Login as {currentPreview.title}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Core Module Capabilities
                </h4>
                <div className="space-y-2">
                  {currentPreview.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Live Key Metrics & Stats
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentPreview.stats.map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center text-center">
                      <Activity className="w-4 h-4 text-brand-400 mx-auto mb-1" />
                      <p className="text-xs font-extrabold text-white">{stat}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-brand-950/40 rounded-2xl border border-brand-900/60 text-xs text-brand-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-400" />
                    Strict Authorization Guaranteed
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Restricted backend API endpoints prevent unauthorized access across departments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Room Grid & Features Highlight */}
      <section id="features" className="py-20 px-6 bg-slate-950 border-t border-slate-800">
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
                title: 'Visual Room & Bed Matrix',
                desc: 'Color-coded room status grid (Green, Yellow, Red, Gray) with strict non-duplicate bed allocation rules.',
              },
              {
                icon: CreditCard,
                title: 'Fee Invoicing & E-Receipts',
                desc: 'Itemized semester billing, online & offline payment recording, automatic balance updates, and printable e-receipts.',
              },
              {
                icon: CalendarCheck,
                title: 'Daily Roll-Call & Leave System',
                desc: 'Hostel-wise bulk attendance marking, student leave applications, and Warden approval management.',
              },
              {
                icon: QrCode,
                title: 'Digital Gate Passes with QR',
                desc: 'Automated curfew tracking, digital pass numbers, and security desk checkout / check-in timestamps.',
              },
              {
                icon: Wrench,
                title: 'Helpdesk & Maintenance Costs',
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
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-950 border border-brand-800/80 text-brand-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
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
      <section id="roles" className="py-20 px-6 border-t border-slate-800 bg-slate-950/60">
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
              { role: 'Student Resident', desc: 'Personal room details, fee invoices, payment receipts, leave & gate pass applications.', color: 'border-brand-500/40 bg-brand-950/20' },
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

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 border-t border-slate-800 bg-slate-950">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold text-brand-400 uppercase tracking-wider">
              Project Viva & Evaluation Q&A
            </span>
            <h2 className="text-3xl font-extrabold text-white">Frequently Asked Architectural Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-brand-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeFaq === index ? 'rotate-180 text-brand-400' : 'text-slate-500'}`} />
                </button>
                {activeFaq === index && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-slate-800 bg-slate-950 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
            H
          </div>
          <span className="font-extrabold text-white text-sm">Hostel Management System (HMS) Enterprise ERP</span>
        </div>
        <p className="text-xs text-slate-500">
          Developed as an Enterprise Full-Stack Capstone IT Engineering Project & Campus ERP Platform.
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 rounded-xl transition-all shadow-md"
          >
            Launch System Demo
          </Link>
        </div>
      </footer>
    </div>
  );
};
