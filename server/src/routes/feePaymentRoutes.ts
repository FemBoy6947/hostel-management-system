import { Router } from 'express';
import {
  getFeeStructures,
  createFeeStructure,
  getStudentFees,
  assignFeeToStudent,
  getPayments,
  recordPayment,
  getPaymentReceipt,
} from '../controllers/feePaymentController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Fee Structures
router.get('/structures', getFeeStructures);
router.post('/structures', authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), createFeeStructure);

// Student Fees
router.get('/student-fees', getStudentFees);
router.post('/student-fees/assign', authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), assignFeeToStudent);

// Payments
router.get('/payments', getPayments);
router.post('/payments/record', authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), recordPayment);
router.get('/payments/:id/receipt', getPaymentReceipt);

export default router;
