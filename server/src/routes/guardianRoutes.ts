import { Router } from 'express';
import { getGuardians, createGuardian, updateGuardian, deleteGuardian } from '../controllers/guardianController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getGuardians);
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), createGuardian);
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), updateGuardian);
router.delete('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), deleteGuardian);

export default router;
