export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'WARDEN'
  | 'ACCOUNTANT'
  | 'SECURITY'
  | 'MESS_STAFF'
  | 'MAINTENANCE'
  | 'STUDENT'
  | 'PARENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  student?: Student;
  guardian?: Guardian;
}

export interface Student {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
    isActive: boolean;
  };
  enrollmentNo: string;
  rollNo?: string;
  dob?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email: string;
  address?: string;
  course: string;
  department: string;
  year: number;
  semester: number;
  admissionDate: string;
  emergencyContact?: string;
  bloodGroup?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';
  createdAt: string;
  allocations?: Allocation[];
  guardians?: { guardian: Guardian; isPrimary: boolean }[];
  fees?: StudentFee[];
}

export interface Guardian {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email?: string;
  occupation?: string;
  address?: string;
  students?: { student: Student }[];
  createdAt: string;
}

export interface Hostel {
  id: string;
  name: string;
  code: string;
  type: 'BOYS' | 'GIRLS' | 'CO_ED';
  address: string;
  capacity: number;
  gender: 'MALE' | 'FEMALE' | 'ALL';
  totalFloors: number;
  totalRooms: number;
  totalBeds: number;
  wardenId?: string;
  warden?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  description?: string;
  totalBedsCount?: number;
  occupiedBedsCount?: number;
  availableBedsCount?: number;
  occupancyRate?: number;
  floors?: Floor[];
}

export interface Floor {
  id: string;
  floorNumber: number;
  name: string;
  hostelId: string;
  hostel?: { name: string; code: string };
  totalRooms: number;
  totalBeds: number;
  rooms?: Room[];
  _count?: { rooms: number };
}

export interface Room {
  id: string;
  roomNumber: string;
  hostelId: string;
  hostel?: { id: string; name: string; code: string };
  floorId: string;
  floor?: { id: string; name: string; floorNumber: number };
  type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_BED' | 'DORMITORY';
  capacity: number;
  currentOccupancy: number;
  feePerMonth: number;
  status: 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE' | 'RESERVED';
  computedStatus?: 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE' | 'RESERVED';
  availableBeds?: number;
  amenities?: string;
  beds?: Bed[];
}

export interface Bed {
  id: string;
  bedNumber: string;
  roomId: string;
  room?: Room;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  allocations?: Allocation[];
}

export interface Allocation {
  id: string;
  studentId: string;
  student: Student;
  hostelId: string;
  hostel: Hostel;
  floorId: string;
  floor: Floor;
  roomId: string;
  room: Room;
  bedId: string;
  bed: Bed;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'RELEASED';
  remarks?: string;
  allocatedBy?: { firstName: string; lastName: string };
  createdAt: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  hostelId: string;
  hostel?: Hostel;
  roomType: string;
  academicYear: string;
  semester: number;
  hostelFee: number;
  messFee: number;
  maintenanceFee: number;
  securityDeposit: number;
  otherCharges: number;
  lateFeePerDay: number;
  dueDate: string;
}

export interface StudentFee {
  id: string;
  studentId: string;
  student?: Student;
  feeStructureId: string;
  feeStructure: FeeStructure;
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  status: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE';
  remarks?: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoiceNo: string;
  studentFeeId: string;
  studentFee?: StudentFee;
  studentId: string;
  student?: Student;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  transactionRef?: string;
  paymentDate: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  receiptUrl?: string;
  remarks?: string;
  receivedBy?: { firstName: string; lastName: string; email: string };
}

export interface Attendance {
  id: string;
  studentId: string;
  student?: Student;
  studentName?: string;
  enrollmentNo?: string;
  roomNumber?: string;
  bedNumber?: string;
  floorName?: string;
  avatar?: string;
  hostelId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'NOT_MARKED';
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  student?: Student;
  leaveType: 'HOME_VISIT' | 'MEDICAL' | 'EMERGENCY' | 'ACADEMIC' | 'OTHER';
  startDate: string;
  endDate: string;
  reason: string;
  emergencyPhone?: string;
  parentPhone?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  wardenRemarks?: string;
  approvedBy?: { firstName: string; lastName: string };
  createdAt: string;
}

export interface Visitor {
  id: string;
  visitorName: string;
  phone: string;
  email?: string;
  idProofType: string;
  idProofNumber: string;
  studentId: string;
  student?: Student;
  relation: string;
  purpose: string;
  photoUrl?: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'INSIDE' | 'CHECKED_OUT';
  securityStaff?: { firstName: string; lastName: string };
  remarks?: string;
}

export interface GatePass {
  id: string;
  passNumber: string;
  studentId: string;
  student?: Student;
  purpose: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  expectedReturnDate: string;
  expectedReturnTime: string;
  actualReturnTime?: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'RETURNED' | 'EXPIRED';
  qrCode?: string;
  approvedBy?: { firstName: string; lastName: string };
  remarks?: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  ticketNo: string;
  studentId: string;
  student?: Student;
  hostelId: string;
  hostel?: Hostel;
  roomId?: string;
  room?: Room;
  category: 'ELECTRICAL' | 'PLUMBING' | 'FURNITURE' | 'CLEANING' | 'INTERNET' | 'SECURITY' | 'MESS' | 'ROOM' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  imageUrl?: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedStaff?: { id: string; firstName: string; lastName: string; email: string; role: string };
  staffRemarks?: string;
  resolutionDate?: string;
  comments?: ComplaintComment[];
  createdAt: string;
}

export interface ComplaintComment {
  id: string;
  complaintId: string;
  userId: string;
  user: { firstName: string; lastName: string; role: string; avatar?: string };
  message: string;
  createdAt: string;
}

export interface MaintenanceTask {
  id: string;
  taskNumber: string;
  complaintId?: string;
  complaint?: { id: string; ticketNo: string; title: string };
  hostelId: string;
  hostel?: { id: string; name: string };
  roomId?: string;
  room?: { id: string; roomNumber: string };
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: { id: string; firstName: string; lastName: string; phone?: string; email: string };
  estimatedCost: number;
  actualCost: number;
  estimatedCompletion?: string;
  actualCompletion?: string;
  notes?: string;
  createdAt: string;
}

export interface MessMenu {
  id: string;
  hostelId: string;
  hostel?: { id: string; name: string };
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  mealType: 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';
  items: string;
  specialItem?: string;
  calorieCount?: number;
  isActive: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  targetAudience: string;
  hostelId?: string;
  hostel?: { id: string; name: string };
  attachmentUrl?: string;
  publishDate: string;
  expiryDate?: string;
  isPinned: boolean;
  createdBy?: { firstName: string; lastName: string; role: string };
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER' | 'SYSTEM';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  module: string;
  recordId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalHostels: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyPercentage: number;
  totalCollectedFees: number;
  totalPendingFees: number;
  pendingComplaints: number;
  activeVisitors: number;
  todayAttendanceCount: number;
  activeGatePasses: number;
}
