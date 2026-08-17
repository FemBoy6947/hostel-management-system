import { Router } from 'express';
import { getAllocations, allocateRoom, transferRoom, releaseAllocation } from '../controllers/allocationController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllocations);
router.post('/allocate', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), allocateRoom);
router.post('/transfer', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), transferRoom);
router.post('/:id/release', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), releaseAllocation);

export default router;
