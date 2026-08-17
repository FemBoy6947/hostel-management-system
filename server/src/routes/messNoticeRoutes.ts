import { Router } from 'express';
import {
  getMessMenu,
  updateMessMenuItem,
  getNotices,
  createNotice,
  deleteNotice,
  getMyNotifications,
  markNotificationAsRead,
} from '../controllers/messNoticeController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Mess Menu
router.get('/mess/menu', getMessMenu);
router.post('/mess/menu', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'MESS_STAFF']), updateMessMenuItem);

// Notices
router.get('/notices', getNotices);
router.post('/notices', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), createNotice);
router.delete('/notices/:id', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), deleteNotice);

// Notifications
router.get('/notifications', getMyNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);

export default router;
