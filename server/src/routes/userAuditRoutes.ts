import { Router } from 'express';
import { getUsers, createUser, updateUserStatus, getAuditLogs } from '../controllers/userAuditController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// User Management
router.get('/users', authorize(['SUPER_ADMIN', 'ADMIN']), getUsers);
router.post('/users', authorize(['SUPER_ADMIN', 'ADMIN']), createUser);
router.put('/users/:id', authorize(['SUPER_ADMIN', 'ADMIN']), updateUserStatus);

// Audit Logs
router.get('/audit-logs', authorize(['SUPER_ADMIN', 'ADMIN']), getAuditLogs);

export default router;
