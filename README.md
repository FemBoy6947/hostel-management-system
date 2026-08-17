# 🏢 Hostel Management System (HMS) — Enterprise Campus ERP

A production-style, full-stack **Hostel Management ERP platform** engineered as a Final Year IT / Computer Science Engineering Capstone Project. Built with **React, TypeScript, Tailwind CSS, Node.js/Express, and Prisma ORM**, featuring strict Role-Based Access Control (RBAC) across 9 personas, real-time visual room availability mapping, digital gate passes, itemized fee billing with printable e-receipts, and comprehensive system auditing.

---

## 🌟 Key Highlights & Feature Matrix

- **9 User Roles & Strict RBAC Guards**:
  1. `Super Admin`: System-wide master controls, database operations, user management, and audit trails.
  2. `Hostel Admin`: Hostel block master, floor plans, room configurations, admissions, and analytics.
  3. `Warden`: Student discipline, floor roll-call, leave approvals, room allocations, and complaint resolution.
  4. `Accountant`: Semester fee structures, student fee assignment, receipt generation, and revenue reports.
  5. `Security Staff`: Digital gate pass verification, check-out / check-in timestamps, and visitor registry.
  6. `Mess Staff`: 7-Day nutritional meal scheduler (Breakfast, Lunch, Snacks, Dinner) and meal attendance.
  7. `Maintenance Staff`: Repair work orders (Electrical, Plumbing, Carpentry), technician assignments, and cost tracking.
  8. `Student Resident`: 360° student profile, assigned room & roommates, fee invoices, digital gate passes, and complaints.
  9. `Parent / Guardian`: Ward attendance records, fee payment status, gate pass tracking, and notices.

- **Visual Room Availability System**:
  - 🟢 **GREEN**: Available
  - 🟡 **YELLOW**: Partially Occupied
  - 🔴 **RED**: Fully Occupied
  - 🔘 **GRAY**: Under Maintenance
  - Strict non-duplicate bed allocation: an active scholar can never occupy multiple beds, and a bed cannot be double-allocated.

- **Finance & E-Receipts**:
  - Invoicing with itemized heads (Hostel Fee, Mess Fee, Maintenance, Security Deposit, Scholarships).
  - Online & offline payments (UPI, Card, Cash, Bank Transfer) with instant printable and downloadable PDF receipts.

- **Interactive API Documentation**:
  - OpenAPI 3.0 / Swagger UI documentation at `http://localhost:5000/api/docs`.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router DOM v6 |
| **Backend** | Node.js, Express.js, TypeScript, RESTful Architecture, Express Rate Limiter, Helmet, Morgan |
| **Database & ORM** | Prisma ORM, SQLite (local zero-dependency dev) / PostgreSQL (production dockerized) |
| **Security** | JWT Access & Refresh Tokens, Bcrypt Password Hashing, RBAC Middleware, Input Validation |
| **DevOps** | Docker, Docker Compose, Multi-stage builds, NGINX |

---

## 🔑 Pre-Seeded Demo Credentials (All 9 Roles)

| Persona | Email | Password | Role Code |
|---|---|---|---|
| **Super Admin** | `superadmin@hms.edu` | `Admin@123` | `SUPER_ADMIN` |
| **Hostel Admin** | `admin@hms.edu` | `Admin@123` | `ADMIN` |
| **Warden (Boys)** | `warden.boys@hms.edu` | `Warden@123` | `WARDEN` |
| **Warden (Girls)** | `warden.girls@hms.edu` | `Warden@123` | `WARDEN` |
| **Accountant** | `accountant@hms.edu` | `Accountant@123` | `ACCOUNTANT` |
| **Security Staff** | `security@hms.edu` | `Security@123` | `SECURITY` |
| **Mess Staff** | `mess@hms.edu` | `Mess@123` | `MESS_STAFF` |
| **Maintenance** | `maintenance@hms.edu` | `Maintenance@123` | `MAINTENANCE` |
| **Student Resident** | `student@hms.edu` | `Student@123` | `STUDENT` |
| **Parent / Guardian** | `parent@hms.edu` | `Parent@123` | `PARENT` |

> 💡 **Viva Tip**: The application includes a **1-Click Quick Login** chip set on the login screen and an active **Role Switcher dropdown** in the header so evaluators can inspect all 9 perspectives seamlessly.

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- Node.js (v18.0+)
- npm (v9.0+)

### 1. Start the Backend API Server
```bash
cd server
npm install
npx prisma db push --accept-data-loss
npm run prisma:seed
npm run dev
```
*Backend runs on `http://localhost:5000` (Swagger UI at `http://localhost:5000/api/docs`)*

### 2. Start the Frontend React Client
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🐳 Docker Deployment

To launch the full stack with PostgreSQL in Docker containers:
```bash
docker-compose up --build -d
```

---

## 📊 Database Architecture (27 Relational Tables)

1. `users`: Master authentication accounts and hashed credentials.
2. `roles`: Distinct role definitions.
3. `permissions`: Granular capability flags.
4. `role_permissions`: Role-to-permission mapping table.
5. `students`: Scholar profiles, enrollment numbers, courses, departments, and blood groups.
6. `guardians`: Parent and local guardian contact profiles.
7. `student_guardians`: Many-to-many link between students and guardians.
8. `hostels`: Residential buildings, capacities, addresses, and assigned wardens.
9. `floors`: Floor layouts linked to hostels.
10. `rooms`: Room numbers, floor links, types (Single, Double, Triple), fee, and status.
11. `beds`: Bed identifiers (A, B, C) and availability states.
12. `allocations`: Active and historical student-to-bed room bindings.
13. `fee_structures`: Semester fee packages with component breakdowns.
14. `student_fees`: Student invoice ledgers, total amounts, paid balances, and dues.
15. `payments`: Payment transactions, reference numbers, payment modes, and receipts.
16. `attendance`: Daily student roll-calls (Present, Absent, Late, Leave).
17. `leave_requests`: Leave applications with Warden approvals.
18. `visitors`: Campus visitor registry with ID proof numbers and timestamps.
19. `gate_passes`: Outing passes with QR codes and curfew return tracking.
20. `complaints`: Maintenance tickets with categories and priority ratings.
21. `complaint_comments`: Discussion threads on open tickets.
22. `maintenance_tasks`: Repair tasks, technician assignments, and cost tracking.
23. `mess_menus`: 7-day nutritional food schedules.
24. `mess_attendance`: Meal attendance counts.
25. `notices`: Official circulars and announcements.
26. `notifications`: Real-time user notification center.
27. `audit_logs`: Immutable administrative action trail.

---

## 🧪 Testing & Viva Demonstration Plan

1. **Authentication & RBAC**: Log in as `Student` (`student@hms.edu`), verify that Admin menus (Users, Reports, Allocations) are hidden and API-restricted.
2. **Visual Room Matrix**: Navigate to `/rooms`, verify rooms colored in Green (Available), Yellow (Partially Occupied), and Red (Full).
3. **Room Allocation**: Navigate to `/allocations`, allocate an available bed, and observe the bed and room occupancy automatically update.
4. **Fee Payment & E-Receipt**: Open `/payments`, record a payment, and click **Print Receipt** to preview the formal institutional voucher.
5. **Digital Gate Pass**: Submit a gate pass as Student, approve it as Warden, and check it out as Security Staff.
6. **CSV Export**: In `/reports`, click **Export CSV** to download raw data spreadsheets.
