import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { createAuditLog } from '../utils/audit';

// ---------------------------------------------------------
// HOSTELS
// ---------------------------------------------------------

export const getHostels = async (req: Request, res: Response) => {
  try {
    const hostels = await prisma.hostel.findMany({
      include: {
        warden: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        _count: {
          select: { floors: true, rooms: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Calculate dynamic occupancy for each hostel
    const enrichedHostels = await Promise.all(
      hostels.map(async (hostel) => {
        const totalBeds = await prisma.bed.count({
          where: { room: { hostelId: hostel.id } },
        });
        const occupiedBeds = await prisma.bed.count({
          where: { room: { hostelId: hostel.id }, status: 'OCCUPIED' },
        });
        const availableBeds = totalBeds - occupiedBeds;
        const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

        return {
          ...hostel,
          totalBedsCount: totalBeds,
          occupiedBedsCount: occupiedBeds,
          availableBedsCount: availableBeds,
          occupancyRate,
        };
      })
    );

    res.json({ success: true, data: enrichedHostels });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch hostels', error: error.message });
  }
};

export const getHostelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hostel = await prisma.hostel.findUnique({
      where: { id },
      include: {
        warden: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        floors: {
          include: {
            rooms: {
              include: {
                beds: {
                  include: {
                    allocations: {
                      where: { status: 'ACTIVE' },
                      include: {
                        student: {
                          include: {
                            user: { select: { firstName: true, lastName: true, email: true, avatar: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.json({ success: true, data: hostel });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch hostel details', error: error.message });
  }
};

export const createHostel = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, type, address, capacity, gender, totalFloors, totalRooms, totalBeds, wardenId, description } = req.body;

    const hostel = await prisma.hostel.create({
      data: {
        name,
        code,
        type: type || 'BOYS',
        address,
        capacity: capacity ? parseInt(capacity) : 100,
        gender: gender || 'MALE',
        totalFloors: totalFloors ? parseInt(totalFloors) : 4,
        totalRooms: totalRooms ? parseInt(totalRooms) : 40,
        totalBeds: totalBeds ? parseInt(totalBeds) : 120,
        wardenId: wardenId || null,
        description,
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'CREATE',
      module: 'HOSTELS',
      recordId: hostel.id,
      details: `Created hostel ${name} (${code})`,
    });

    res.status(201).json({ success: true, message: 'Hostel created successfully', data: hostel });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create hostel', error: error.message });
  }
};

export const updateHostel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, type, address, capacity, gender, totalFloors, totalRooms, totalBeds, wardenId, status, description } = req.body;

    const updated = await prisma.hostel.update({
      where: { id },
      data: {
        name,
        code,
        type,
        address,
        capacity: capacity ? parseInt(capacity) : undefined,
        gender,
        totalFloors: totalFloors ? parseInt(totalFloors) : undefined,
        totalRooms: totalRooms ? parseInt(totalRooms) : undefined,
        totalBeds: totalBeds ? parseInt(totalBeds) : undefined,
        wardenId: wardenId !== undefined ? wardenId : undefined,
        status,
        description,
      },
    });

    res.json({ success: true, message: 'Hostel updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update hostel', error: error.message });
  }
};

export const deleteHostel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.hostel.delete({ where: { id } });
    res.json({ success: true, message: 'Hostel deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete hostel', error: error.message });
  }
};

// ---------------------------------------------------------
// FLOORS
// ---------------------------------------------------------

export const getFloors = async (req: Request, res: Response) => {
  try {
    const { hostelId } = req.query;
    const where: any = {};
    if (hostelId) where.hostelId = String(hostelId);

    const floors = await prisma.floor.findMany({
      where,
      include: {
        hostel: { select: { name: true, code: true } },
        _count: { select: { rooms: true } },
      },
      orderBy: { floorNumber: 'asc' },
    });

    res.json({ success: true, data: floors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch floors', error: error.message });
  }
};

export const createFloor = async (req: AuthRequest, res: Response) => {
  try {
    const { hostelId, floorNumber, name, totalRooms, totalBeds } = req.body;
    const floor = await prisma.floor.create({
      data: {
        hostelId,
        floorNumber: parseInt(floorNumber),
        name: name || `Floor ${floorNumber}`,
        totalRooms: totalRooms ? parseInt(totalRooms) : 10,
        totalBeds: totalBeds ? parseInt(totalBeds) : 30,
      },
    });

    res.status(201).json({ success: true, message: 'Floor created successfully', data: floor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create floor', error: error.message });
  }
};

export const updateFloor = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, floorNumber, totalRooms, totalBeds } = req.body;

    const floor = await prisma.floor.update({
      where: { id },
      data: {
        name,
        floorNumber: floorNumber ? parseInt(floorNumber) : undefined,
        totalRooms: totalRooms ? parseInt(totalRooms) : undefined,
        totalBeds: totalBeds ? parseInt(totalBeds) : undefined,
      },
    });

    res.json({ success: true, message: 'Floor updated successfully', data: floor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update floor', error: error.message });
  }
};

export const deleteFloor = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.floor.delete({ where: { id } });
    res.json({ success: true, message: 'Floor deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete floor', error: error.message });
  }
};

// ---------------------------------------------------------
// ROOMS
// ---------------------------------------------------------

export const getRooms = async (req: Request, res: Response) => {
  try {
    const { hostelId, floorId, status, type, search } = req.query;
    const where: any = {};

    if (hostelId) where.hostelId = String(hostelId);
    if (floorId) where.floorId = String(floorId);
    if (status) where.status = String(status);
    if (type) where.type = String(type);
    if (search) where.roomNumber = { contains: String(search) };

    const rooms = await prisma.room.findMany({
      where,
      include: {
        hostel: { select: { id: true, name: true, code: true } },
        floor: { select: { id: true, name: true, floorNumber: true } },
        beds: {
          include: {
            allocations: {
              where: { status: 'ACTIVE' },
              include: {
                student: {
                  include: {
                    user: { select: { firstName: true, lastName: true, email: true, avatar: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ hostel: { name: 'asc' } }, { roomNumber: 'asc' }],
    });

    // Recompute room status dynamically
    const computedRooms = rooms.map((room) => {
      const occupiedCount = room.beds.filter((b) => b.status === 'OCCUPIED').length;
      let computedStatus = room.status;

      if (room.status !== 'MAINTENANCE' && room.status !== 'RESERVED') {
        if (occupiedCount === 0) computedStatus = 'AVAILABLE';
        else if (occupiedCount < room.capacity) computedStatus = 'PARTIALLY_OCCUPIED';
        else computedStatus = 'FULL';
      }

      return {
        ...room,
        currentOccupancy: occupiedCount,
        availableBeds: room.capacity - occupiedCount,
        computedStatus,
      };
    });

    res.json({ success: true, data: computedRooms });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch rooms', error: error.message });
  }
};

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { hostelId, floorId, roomNumber, type, capacity, feePerMonth, amenities } = req.body;

    const cap = capacity ? parseInt(capacity) : 2;

    const room = await prisma.$transaction(async (tx) => {
      const createdRoom = await tx.room.create({
        data: {
          hostelId,
          floorId,
          roomNumber,
          type: type || 'DOUBLE',
          capacity: cap,
          feePerMonth: feePerMonth ? parseFloat(feePerMonth) : 5000,
          amenities,
          status: 'AVAILABLE',
        },
      });

      // Auto create beds for the room: Bed A, Bed B, etc.
      const bedLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
      const bedData = Array.from({ length: cap }).map((_, i) => ({
        roomId: createdRoom.id,
        bedNumber: `${roomNumber}-${bedLetters[i] || i + 1}`,
        status: 'AVAILABLE',
      }));

      await tx.bed.createMany({ data: bedData });

      return createdRoom;
    });

    await createAuditLog({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'CREATE',
      module: 'ROOMS',
      recordId: room.id,
      details: `Created room ${roomNumber} with ${cap} beds`,
    });

    res.status(201).json({ success: true, message: 'Room and beds created successfully', data: room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create room', error: error.message });
  }
};

export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { roomNumber, type, capacity, feePerMonth, status, amenities } = req.body;

    const room = await prisma.room.update({
      where: { id },
      data: {
        roomNumber,
        type,
        capacity: capacity ? parseInt(capacity) : undefined,
        feePerMonth: feePerMonth ? parseFloat(feePerMonth) : undefined,
        status,
        amenities,
      },
    });

    res.json({ success: true, message: 'Room updated successfully', data: room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update room', error: error.message });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.room.delete({ where: { id } });
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete room', error: error.message });
  }
};

// ---------------------------------------------------------
// BEDS
// ---------------------------------------------------------

export const getBeds = async (req: Request, res: Response) => {
  try {
    const { roomId, status, hostelId } = req.query;
    const where: any = {};

    if (roomId) where.roomId = String(roomId);
    if (status) where.status = String(status);
    if (hostelId) where.room = { hostelId: String(hostelId) };

    const beds = await prisma.bed.findMany({
      where,
      include: {
        room: {
          include: {
            hostel: { select: { name: true, code: true } },
            floor: { select: { name: true, floorNumber: true } },
          },
        },
        allocations: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              include: { user: { select: { firstName: true, lastName: true, email: true } } },
            },
          },
        },
      },
      orderBy: { bedNumber: 'asc' },
    });

    res.json({ success: true, data: beds });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch beds', error: error.message });
  }
};

export const updateBedStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bed = await prisma.bed.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, message: 'Bed status updated successfully', data: bed });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update bed status', error: error.message });
  }
};
