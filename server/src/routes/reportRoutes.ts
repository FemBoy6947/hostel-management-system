import { Router } from 'express';
import { getOccupancyReport, getFinancialReport, exportReportCsv } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/occupancy', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), getOccupancyReport);
router.get('/financial', authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), getFinancialReport);
router.get('/export/:type', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'ACCOUNTANT']), exportReportCsv);

export default router;
