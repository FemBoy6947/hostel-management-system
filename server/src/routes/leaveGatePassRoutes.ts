import { Router } from 'express';
import {
  getLeaveRequests,
  applyLeaveRequest,
  updateLeaveStatus,
  getGatePasses,
  applyGatePass,
  updateGatePassStatus,
  getVisitors,
  registerVisitor,
  checkOutVisitor,
} from '../controllers/leaveGatePassController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Leaves
router.get('/leaves', getLeaveRequests);
router.post('/leaves/apply', applyLeaveRequest);
router.put('/leaves/:id/status', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), updateLeaveStatus);

// Gate Passes
router.get('/gate-passes', getGatePasses);
router.post('/gate-passes/apply', applyGatePass);
router.put('/gate-passes/:id/status', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'SECURITY']), updateGatePassStatus);

// Visitors
router.get('/visitors', getVisitors);
router.post('/visitors/register', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'SECURITY']), registerVisitor);
router.put('/visitors/:id/checkout', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'SECURITY']), checkOutVisitor);

export default router;
