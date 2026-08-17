import { Router } from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), createStudent);
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), updateStudent);
router.delete('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), deleteStudent);

export default router;
