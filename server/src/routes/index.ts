import { Router } from 'express';
import authRoutes from './authRoutes';
import studentRoutes from './studentRoutes';
import guardianRoutes from './guardianRoutes';
import hostelRoutes from './hostelRoutes';
import allocationRoutes from './allocationRoutes';
import feePaymentRoutes from './feePaymentRoutes';
import attendanceRoutes from './attendanceRoutes';
import leaveGatePassRoutes from './leaveGatePassRoutes';
import complaintMaintenanceRoutes from './complaintMaintenanceRoutes';
import messNoticeRoutes from './messNoticeRoutes';
import reportRoutes from './reportRoutes';
import userAuditRoutes from './userAuditRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/guardians', guardianRoutes);
router.use('/hostels', hostelRoutes);
router.use('/allocations', allocationRoutes);
router.use('/fees', feePaymentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/', leaveGatePassRoutes); // /leaves, /gate-passes, /visitors
router.use('/', complaintMaintenanceRoutes); // /complaints, /maintenance
router.use('/', messNoticeRoutes); // /mess, /notices, /notifications
router.use('/reports', reportRoutes);
router.use('/', userAuditRoutes); // /users, /audit-logs
router.use('/dashboard', dashboardRoutes);

export default router;
