import { Router } from 'express';
import {
  getComplaints,
  createComplaint,
  updateComplaint,
  addComplaintComment,
  getMaintenanceTasks,
  createMaintenanceTask,
  updateMaintenanceTask,
} from '../controllers/complaintMaintenanceController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Complaints
router.get('/complaints', getComplaints);
router.post('/complaints', createComplaint);
router.put('/complaints/:id', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'MAINTENANCE']), updateComplaint);
router.post('/complaints/:id/comments', addComplaintComment);

// Maintenance Tasks
router.get('/maintenance', getMaintenanceTasks);
router.post('/maintenance', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'MAINTENANCE']), createMaintenanceTask);
router.put('/maintenance/:id', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'MAINTENANCE']), updateMaintenanceTask);

export default router;
