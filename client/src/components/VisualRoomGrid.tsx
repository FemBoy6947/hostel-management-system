import React, { useState } from 'react';
import { Room, Bed } from '../types';
import { UserCheck, ShieldAlert, BedDouble, Info, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { Badge } from './Badge';

interface VisualRoomGridProps {
  rooms: Room[];
  onSelectRoom?: (room: Room) => void;
  onAllocateBed?: (room: Room, bed: Bed) => void;
}

export const VisualRoomGrid: React.FC<VisualRoomGridProps> = ({
  rooms,
  onSelectRoom,
  onAllocateBed,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: 'bg-emerald-50 hover:bg-emerald-100/80',
          border: 'border-emerald-300',
          badge: 'success' as const,
          indicator: 'bg-emerald-500',
          text: 'Available',
        };
      case 'PARTIALLY_OCCUPIED':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100/80',
          border: 'border-amber-300',
          badge: 'warning' as const,
          indicator: 'bg-amber-500',
          text: 'Partially Occupied',
        };
      case 'FULL':
        return {
          bg: 'bg-rose-50 hover:bg-rose-100/80',
          border: 'border-rose-300',
          badge: 'danger' as const,
          indicator: 'bg-rose-500',
          text: 'Full',
        };
      case 'MAINTENANCE':
      case 'RESERVED':
      default:
        return {
          bg: 'bg-slate-100 hover:bg-slate-200/80',
          border: 'border-slate-300',
          badge: 'neutral' as const,
          indicator: 'bg-slate-500',
          text: 'Maintenance',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 text-xs font-medium text-slate-600">
        <span className="font-bold text-slate-800">Status Indicator:</span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span>Available (Green)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>Partially Occupied (Yellow)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500"></span>
          <span>Full (Red)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-500"></span>
          <span>Maintenance (Gray)</span>
        </div>
      </div>

      {/* Grid of Rooms */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {rooms.map((room) => {
          const statusInfo = getStatusColor(room.computedStatus || room.status);

          return (
            <div
              key={room.id}
              onClick={() => {
                setSelectedRoom(room);
                if (onSelectRoom) onSelectRoom(room);
              }}
              className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${statusInfo.bg} ${statusInfo.border}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {room.type}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.indicator}`} />
              </div>

              <div className="my-2.5 text-center">
                <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {room.roomNumber}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Floor {room.floor?.floorNumber || 'G'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{room.currentOccupancy} / {room.capacity} Beds</span>
                <span className="text-[10px] text-slate-400 uppercase">₹{room.feePerMonth}/mo</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Details Modal */}
      {selectedRoom && (
        <Modal
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          title={`Room ${selectedRoom.roomNumber} Details & Bed Allocation`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-400 font-medium">Hostel</span>
                <p className="font-semibold text-slate-800">{selectedRoom.hostel?.name || 'Main Hostel'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Room Type</span>
                <p className="font-semibold text-slate-800">{selectedRoom.type} ({selectedRoom.capacity} Bed Capacity)</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Occupancy Status</span>
                <div className="mt-0.5">
                  <Badge variant={getStatusColor(selectedRoom.computedStatus || selectedRoom.status).badge}>
                    {selectedRoom.computedStatus || selectedRoom.status}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Monthly Fee</span>
                <p className="font-semibold text-slate-800">₹{selectedRoom.feePerMonth?.toLocaleString()}</p>
              </div>
            </div>

            {selectedRoom.amenities && (
              <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
                <span className="text-xs font-bold text-brand-800 uppercase tracking-wide">Amenities & Features</span>
                <p className="text-xs text-brand-900 mt-1">{selectedRoom.amenities}</p>
              </div>
            )}

            <div>
              <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-slate-500" />
                Bed Allotment Matrix
              </h5>

              <div className="space-y-2">
                {selectedRoom.beds && selectedRoom.beds.length > 0 ? (
                  selectedRoom.beds.map((bed) => {
                    const activeAlloc = bed.allocations && bed.allocations[0];
                    const isOccupied = bed.status === 'OCCUPIED' && activeAlloc;

                    return (
                      <div
                        key={bed.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isOccupied
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-emerald-50/60 border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isOccupied ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            <BedDouble className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">Bed {bed.bedNumber}</span>
                              <Badge variant={isOccupied ? 'danger' : 'success'}>
                                {isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
                              </Badge>
                            </div>
                            {isOccupied && (
                              <p className="text-xs text-slate-600 mt-0.5">
                                Allocated to:{' '}
                                <strong className="text-slate-900">
                                  {activeAlloc.student?.user?.firstName} {activeAlloc.student?.user?.lastName}
                                </strong>{' '}
                                ({activeAlloc.student?.enrollmentNo || 'N/A'})
                              </p>
                            )}
                          </div>
                        </div>

                        {!isOccupied && onAllocateBed && (
                          <button
                            onClick={() => {
                              onAllocateBed(selectedRoom, bed);
                              setSelectedRoom(null);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                          >
                            Allocate Bed
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400">No beds configured for this room.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
