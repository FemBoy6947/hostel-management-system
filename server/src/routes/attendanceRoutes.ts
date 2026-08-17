import { Router } from 'express';
import {
  getAttendanceByDateAndHostel,
  markBulkAttendance,
  getStudentAttendanceHistory,
} from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getAttendanceByDateAndHostel);
router.post('/mark-bulk', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), markBulkAttendance);
router.get('/student/:studentId', getStudentAttendanceHistory);

export default router;
