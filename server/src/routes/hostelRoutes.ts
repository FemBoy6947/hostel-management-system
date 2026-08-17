import { Router } from 'express';
import {
  getHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
  getFloors,
  createFloor,
  updateFloor,
  deleteFloor,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getBeds,
  updateBedStatus,
} from '../controllers/hostelController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Hostels
router.get('/', getHostels);
router.get('/:id', getHostelById);
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN']), createHostel);
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), updateHostel);
router.delete('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), deleteHostel);

// Floors
router.get('/floors/list', getFloors);
router.post('/floors', authorize(['SUPER_ADMIN', 'ADMIN']), createFloor);
router.put('/floors/:id', authorize(['SUPER_ADMIN', 'ADMIN']), updateFloor);
router.delete('/floors/:id', authorize(['SUPER_ADMIN', 'ADMIN']), deleteFloor);

// Rooms
router.get('/rooms/list', getRooms);
router.post('/rooms', authorize(['SUPER_ADMIN', 'ADMIN']), createRoom);
router.put('/rooms/:id', authorize(['SUPER_ADMIN', 'ADMIN']), updateRoom);
router.delete('/rooms/:id', authorize(['SUPER_ADMIN', 'ADMIN']), deleteRoom);

// Beds
router.get('/beds/list', getBeds);
router.put('/beds/:id/status', authorize(['SUPER_ADMIN', 'ADMIN', 'WARDEN']), updateBedStatus);

export default router;
