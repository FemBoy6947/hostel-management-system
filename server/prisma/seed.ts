import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for Hostel Management System (HMS)...');

  // Clear existing records in reverse dependency order
  await prisma.attachment.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.messAttendance.deleteMany();
  await prisma.messMenu.deleteMany();
  await prisma.maintenanceTask.deleteMany();
  await prisma.complaintComment.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.gatePass.deleteMany();
  await prisma.visitor.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.studentFee.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.hostel.deleteMany();
  await prisma.studentGuardian.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.student.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // ---------------------------------------------------------
  // 1. ROLES & PERMISSIONS
  // ---------------------------------------------------------
  const roles = [
    { name: 'SUPER_ADMIN', description: 'System-wide Super Administrator with full unrestricted control' },
    { name: 'ADMIN', description: 'Hostel administrator managing staff, fees, allocations and reports' },
    { name: 'WARDEN', description: 'Hostel warden managing student discipline, leaves, attendance, and rooms' },
    { name: 'ACCOUNTANT', description: 'Financial officer managing fee structures, invoicing, payments and receipts' },
    { name: 'SECURITY', description: 'Security personnel managing gate entries, visitor logs, and gate passes' },
    { name: 'MESS_STAFF', description: 'Mess manager in charge of weekly meal menus and meal attendance' },
    { name: 'MAINTENANCE', description: 'Maintenance supervisor managing repair tickets and equipment costs' },
    { name: 'STUDENT', description: 'Hostel resident viewing room info, paying fees, and applying for leaves' },
    { name: 'PARENT', description: 'Student guardian tracking attendance, notices, and fee clearance' },
  ];

  for (const r of roles) {
    await prisma.role.create({ data: r });
  }

  // ---------------------------------------------------------
  // 2. DEMO USERS (ALL 9 ROLES)
  // ---------------------------------------------------------
  const defaultPassword = await bcrypt.hash('Admin@123', 10);
  const wardenPassword = await bcrypt.hash('Warden@123', 10);
  const acctPassword = await bcrypt.hash('Accountant@123', 10);
  const secPassword = await bcrypt.hash('Security@123', 10);
  const messPassword = await bcrypt.hash('Mess@123', 10);
  const maintPassword = await bcrypt.hash('Maintenance@123', 10);
  const studentPassword = await bcrypt.hash('Student@123', 10);
  const parentPassword = await bcrypt.hash('Parent@123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@hms.edu',
      password: defaultPassword,
      firstName: 'Vikramaditya',
      lastName: 'Singhania',
      phone: '+91 9876543210',
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@hms.edu',
      password: defaultPassword,
      firstName: 'Dr. Rajesh',
      lastName: 'Sharma',
      phone: '+91 9876543211',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const wardenBoys = await prisma.user.create({
    data: {
      email: 'warden.boys@hms.edu',
      password: wardenPassword,
      firstName: 'Prof. Alok',
      lastName: 'Verma',
      phone: '+91 9876543212',
      role: 'WARDEN',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const wardenGirls = await prisma.user.create({
    data: {
      email: 'warden.girls@hms.edu',
      password: wardenPassword,
      firstName: 'Dr. Sunita',
      lastName: 'Deshmukh',
      phone: '+91 9876543213',
      role: 'WARDEN',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const accountant = await prisma.user.create({
    data: {
      email: 'accountant@hms.edu',
      password: acctPassword,
      firstName: 'Ramesh',
      lastName: 'Gupta',
      phone: '+91 9876543214',
      role: 'ACCOUNTANT',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  const securityStaff = await prisma.user.create({
    data: {
      email: 'security@hms.edu',
      password: secPassword,
      firstName: 'Dharamvir',
      lastName: 'Singh',
      phone: '+91 9876543215',
      role: 'SECURITY',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
  });

  const messStaff = await prisma.user.create({
    data: {
      email: 'mess@hms.edu',
      password: messPassword,
      firstName: 'Chef Anand',
      lastName: 'Mishra',
      phone: '+91 9876543216',
      role: 'MESS_STAFF',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
    },
  });

  const maintenanceStaff = await prisma.user.create({
    data: {
      email: 'maintenance@hms.edu',
      password: maintPassword,
      firstName: 'Suresh',
      lastName: 'Kumar',
      phone: '+91 9876543217',
      role: 'MAINTENANCE',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    },
  });

  const demoParentUser = await prisma.user.create({
    data: {
      email: 'parent@hms.edu',
      password: parentPassword,
      firstName: 'Sanjay',
      lastName: 'Patel',
      phone: '+91 9811223344',
      role: 'PARENT',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    },
  });

  console.log('✅ Staff & Admin users created.');

  // ---------------------------------------------------------
  // 3. HOSTELS
  // ---------------------------------------------------------
  const boysHostel = await prisma.hostel.create({
    data: {
      name: 'Aryabhata Boys Hostel',
      code: 'ABH-01',
      type: 'BOYS',
      address: 'North Campus, Engineering Block A',
      capacity: 120,
      gender: 'MALE',
      totalFloors: 3,
      totalRooms: 30,
      totalBeds: 60,
      wardenId: wardenBoys.id,
      description: 'Premier residential hostel for undergraduate engineering students with Wi-Fi, gym, and solar water heating.',
    },
  });

  const girlsHostel = await prisma.hostel.create({
    data: {
      name: 'Gargi Girls Hostel',
      code: 'GGH-02',
      type: 'GIRLS',
      address: 'South Campus, Academic Square',
      capacity: 120,
      gender: 'FEMALE',
      totalFloors: 3,
      totalRooms: 30,
      totalBeds: 60,
      wardenId: wardenGirls.id,
      description: 'High-security hostel facility for female scholars with 24/7 CCTV surveillance, study lounge, and badminton court.',
    },
  });

  const pgHostel = await prisma.hostel.create({
    data: {
      name: 'Vikram Sarabhai PG Hostel',
      code: 'VSP-03',
      type: 'CO_ED',
      address: 'East Campus, Innovation Hub',
      capacity: 60,
      gender: 'ALL',
      totalFloors: 2,
      totalRooms: 20,
      totalBeds: 40,
      wardenId: wardenBoys.id,
      description: 'Air-conditioned single and double occupancy suites for Postgraduate and Ph.D. research fellows.',
    },
  });

  console.log('✅ 3 Hostels created.');

  // ---------------------------------------------------------
  // 4. FLOORS, ROOMS & BEDS
  // ---------------------------------------------------------
  const createdHostels = [boysHostel, girlsHostel, pgHostel];
  const allCreatedRooms: any[] = [];
  const allCreatedBeds: any[] = [];

  for (const h of createdHostels) {
    const floorCount = h.totalFloors;
    for (let f = 1; f <= floorCount; f++) {
      const floor = await prisma.floor.create({
        data: {
          hostelId: h.id,
          floorNumber: f,
          name: f === 1 ? 'Ground Floor' : `${f - 1}st Floor`,
          totalRooms: 6,
          totalBeds: 12,
        },
      });

      // Create 6 rooms per floor (Total ~18 rooms per hostel)
      for (let r = 1; r <= 6; r++) {
        const roomNum = `${f}0${r}`;
        const roomType = r === 1 ? 'SINGLE' : r <= 4 ? 'DOUBLE' : 'TRIPLE';
        const capacity = roomType === 'SINGLE' ? 1 : roomType === 'DOUBLE' ? 2 : 3;
        const fee = roomType === 'SINGLE' ? 7500 : roomType === 'DOUBLE' ? 5500 : 4200;
        const amenities = roomType === 'SINGLE' ? 'AC, Attached Bath, Study Table, Balcony' : 'Ceiling Fan, Study Tables, Wardrobes';

        const room = await prisma.room.create({
          data: {
            hostelId: h.id,
            floorId: floor.id,
            roomNumber: roomNum,
            type: roomType,
            capacity,
            currentOccupancy: 0,
            feePerMonth: fee,
            status: 'AVAILABLE',
            amenities,
          },
        });
        allCreatedRooms.push(room);

        // Create Beds
        const bedLetters = ['A', 'B', 'C'];
        for (let b = 0; b < capacity; b++) {
          const bed = await prisma.bed.create({
            data: {
              roomId: room.id,
              bedNumber: `${roomNum}-${bedLetters[b]}`,
              status: 'AVAILABLE',
            },
          });
          allCreatedBeds.push({ ...bed, hostelId: h.id, roomType });
        }
      }
    }
  }

  console.log(`✅ Created ${allCreatedRooms.length} rooms and ${allCreatedBeds.length} individual beds.`);

  // ---------------------------------------------------------
  // 5. STUDENTS (50+ Real Students with User Accounts)
  // ---------------------------------------------------------
  const studentRawData = [
    { first: 'Aarav', last: 'Sharma', gender: 'MALE', dept: 'CSE', course: 'B.Tech', year: 3, sem: 6, blood: 'O+' },
    { first: 'Ananya', last: 'Verma', gender: 'FEMALE', dept: 'IT', course: 'B.Tech', year: 2, sem: 4, blood: 'A+' },
    { first: 'Rohan', last: 'Mehta', gender: 'MALE', dept: 'ECE', course: 'B.Tech', year: 4, sem: 8, blood: 'B+' },
    { first: 'Ishita', last: 'Gupta', gender: 'FEMALE', dept: 'CSE', course: 'B.Tech', year: 1, sem: 2, blood: 'AB+' },
    { first: 'Kabir', last: 'Kapoor', gender: 'MALE', dept: 'Mechanical', course: 'B.Tech', year: 3, sem: 5, blood: 'O-' },
    { first: 'Diya', last: 'Patel', gender: 'FEMALE', dept: 'Civil', course: 'B.Tech', year: 2, sem: 3, blood: 'B-' },
    { first: 'Aditya', last: 'Rao', gender: 'MALE', dept: 'AI & ML', course: 'B.Tech', year: 2, sem: 4, blood: 'A-' },
    { first: 'Sneha', last: 'Reddy', gender: 'FEMALE', dept: 'IT', course: 'MCA', year: 1, sem: 2, blood: 'O+' },
    { first: 'Vikram', last: 'Joshi', gender: 'MALE', dept: 'CSE', course: 'M.Tech', year: 1, sem: 2, blood: 'A+' },
    { first: 'Pooja', last: 'Nair', gender: 'FEMALE', dept: 'Management', course: 'MBA', year: 2, sem: 4, blood: 'B+' },
    { first: 'Devansh', last: 'Chopra', gender: 'MALE', dept: 'CSE', course: 'B.Tech', year: 1, sem: 1, blood: 'O+' },
    { first: 'Kavya', last: 'Iyer', gender: 'FEMALE', dept: 'Data Science', course: 'B.Tech', year: 3, sem: 5, blood: 'AB+' },
    { first: 'Manish', last: 'Tiwari', gender: 'MALE', dept: 'IT', course: 'B.Tech', year: 4, sem: 7, blood: 'A+' },
    { first: 'Riya', last: 'Sen', gender: 'FEMALE', dept: 'ECE', course: 'B.Tech', year: 2, sem: 4, blood: 'O+' },
    { first: 'Harsh', last: 'Vardhan', gender: 'MALE', dept: 'CSE', course: 'B.Tech', year: 3, sem: 6, blood: 'B+' },
    { first: 'Tanvi', last: 'Bhatia', gender: 'FEMALE', dept: 'CSE', course: 'B.Tech', year: 2, sem: 3, blood: 'A-' },
    { first: 'Ayush', last: 'Saxena', gender: 'MALE', dept: 'Civil', course: 'B.Tech', year: 1, sem: 2, blood: 'O+' },
    { first: 'Simran', last: 'Kaur', gender: 'FEMALE', dept: 'IT', course: 'B.Tech', year: 3, sem: 6, blood: 'AB-' },
    { first: 'Nikhil', last: 'Bose', gender: 'MALE', dept: 'ECE', course: 'B.Tech', year: 4, sem: 8, blood: 'B+' },
    { first: 'Meera', last: 'Menon', gender: 'FEMALE', dept: 'AI & ML', course: 'B.Tech', year: 2, sem: 4, blood: 'A+' },
    { first: 'Siddharth', last: 'Rathore', gender: 'MALE', dept: 'CSE', course: 'B.Tech', year: 3, sem: 5, blood: 'O+' },
    { first: 'Anushka', last: 'Roy', gender: 'FEMALE', dept: 'IT', course: 'B.Tech', year: 1, sem: 1, blood: 'B+' },
    { first: 'Gaurav', last: 'Pandey', gender: 'MALE', dept: 'Mechanical', course: 'B.Tech', year: 2, sem: 4, blood: 'A+' },
    { first: 'Neha', last: 'Bhardwaj', gender: 'FEMALE', dept: 'CSE', course: 'B.Tech', year: 3, sem: 6, blood: 'O-' },
    { first: 'Karan', last: 'Chawla', gender: 'MALE', dept: 'Data Science', course: 'B.Tech', year: 4, sem: 7, blood: 'AB+' },
  ];

  // Repeat and expand to 50 students
  const fullStudentList: any[] = [];
  for (let cycle = 0; cycle < 2; cycle++) {
    for (const item of studentRawData) {
      const idx = fullStudentList.length + 1;
      const email = idx === 1 ? 'student@hms.edu' : `${item.first.toLowerCase()}.${item.last.toLowerCase()}${idx}@hms.edu`;
      const enroll = `ENR-2026-${1000 + idx}`;
      const roll = `22CS${100 + idx}`;
      fullStudentList.push({
        ...item,
        email,
        enrollmentNo: enroll,
        rollNo: roll,
        phone: `+91 91234${String(50000 + idx).padStart(5, '0')}`,
      });
    }
  }

  const createdStudents: any[] = [];

  for (let i = 0; i < fullStudentList.length; i++) {
    const s = fullStudentList[i];
    const user = await prisma.user.create({
      data: {
        email: s.email,
        password: studentPassword,
        firstName: s.first,
        lastName: i > 24 ? `${s.last} (Jr)` : s.last,
        phone: s.phone,
        role: 'STUDENT',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.first}${i}`,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        enrollmentNo: s.enrollmentNo,
        rollNo: s.rollNo,
        gender: s.gender,
        dob: new Date(2003, i % 12, (i % 25) + 1),
        phone: s.phone,
        email: s.email,
        address: `${100 + i}, Tech City Boulevard, Sector ${i % 15 + 1}, New Delhi, India`,
        course: s.course,
        department: s.dept,
        year: s.year,
        semester: s.sem,
        bloodGroup: s.blood,
        emergencyContact: `+91 98223${String(40000 + i).padStart(5, '0')}`,
        status: 'ACTIVE',
      },
    });

    createdStudents.push({ ...student, user });
  }

  console.log(`✅ Created ${createdStudents.length} student records and user credentials.`);

  // ---------------------------------------------------------
  // 6. GUARDIANS & LINKS
  // ---------------------------------------------------------
  const guardianObj = await prisma.guardian.create({
    data: {
      userId: demoParentUser.id,
      name: 'Sanjay Patel',
      relation: 'FATHER',
      phone: '+91 9811223344',
      email: 'parent@hms.edu',
      occupation: 'Civil Engineer',
      address: '104, Sunrise Heights, Ahmedabad, Gujarat',
    },
  });

  // Link first student to demo parent
  await prisma.studentGuardian.create({
    data: {
      studentId: createdStudents[0].id,
      guardianId: guardianObj.id,
      isPrimary: true,
    },
  });

  // ---------------------------------------------------------
  // 7. ROOM & BED ALLOCATIONS
  // ---------------------------------------------------------
  let allocatedCount = 0;
  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i];
    const isMale = student.gender === 'MALE';
    const targetHostel = isMale ? boysHostel : girlsHostel;

    // Find available bed in target hostel
    const availableBed = allCreatedBeds.find(
      (b) => b.hostelId === targetHostel.id && b.status === 'AVAILABLE'
    );

    if (availableBed && i < 40) {
      const room = allCreatedRooms.find((r) => r.id === availableBed.roomId);

      await prisma.allocation.create({
        data: {
          studentId: student.id,
          hostelId: targetHostel.id,
          floorId: room.floorId,
          roomId: room.id,
          bedId: availableBed.id,
          startDate: new Date(2026, 0, 15),
          status: 'ACTIVE',
          remarks: 'Semester Allocation 2026-27',
          allocatedById: isMale ? wardenBoys.id : wardenGirls.id,
        },
      });

      // Update Bed status
      await prisma.bed.update({
        where: { id: availableBed.id },
        data: { status: 'OCCUPIED' },
      });
      availableBed.status = 'OCCUPIED';

      // Update Room occupancy
      const occupiedBedsInRoom = allCreatedBeds.filter(
        (b) => b.roomId === room.id && b.status === 'OCCUPIED'
      ).length;

      let rStatus = 'PARTIALLY_OCCUPIED';
      if (occupiedBedsInRoom >= room.capacity) rStatus = 'FULL';

      await prisma.room.update({
        where: { id: room.id },
        data: {
          currentOccupancy: occupiedBedsInRoom,
          status: rStatus,
        },
      });

      allocatedCount++;
    }
  }

  console.log(`✅ Allocated ${allocatedCount} students to hostel rooms & beds.`);

  // ---------------------------------------------------------
  // 8. FEE STRUCTURES, INVOICES & PAYMENTS
  // ---------------------------------------------------------
  const feeStructureRegular = await prisma.feeStructure.create({
    data: {
      name: 'Spring Semester 2026 - Standard Package',
      hostelId: boysHostel.id,
      roomType: 'DOUBLE',
      academicYear: '2025-2026',
      semester: 2,
      hostelFee: 32000,
      messFee: 22000,
      maintenanceFee: 3000,
      securityDeposit: 5000,
      otherCharges: 1000,
      lateFeePerDay: 50,
      dueDate: new Date(2026, 8, 30),
    },
  });

  const feeStructureAC = await prisma.feeStructure.create({
    data: {
      name: 'Spring Semester 2026 - Premium AC Single',
      hostelId: girlsHostel.id,
      roomType: 'SINGLE',
      academicYear: '2025-2026',
      semester: 2,
      hostelFee: 45000,
      messFee: 22000,
      maintenanceFee: 4000,
      securityDeposit: 5000,
      otherCharges: 1500,
      lateFeePerDay: 50,
      dueDate: new Date(2026, 8, 30),
    },
  });

  for (let i = 0; i < 30; i++) {
    const student = createdStudents[i];
    const feeStruct = i % 2 === 0 ? feeStructureRegular : feeStructureAC;
    const totalAmount = 63000;
    const discount = i % 5 === 0 ? 5000 : 0;
    const finalAmount = totalAmount - discount;
    const isPaid = i % 3 === 0;
    const isPartial = i % 3 === 1;

    const paidAmt = isPaid ? finalAmount : isPartial ? 30000 : 0;
    const balanceAmt = finalAmount - paidAmt;
    const status = isPaid ? 'PAID' : isPartial ? 'PARTIALLY_PAID' : 'PENDING';

    const sf = await prisma.studentFee.create({
      data: {
        studentId: student.id,
        feeStructureId: feeStruct.id,
        totalAmount,
        discountAmount: discount,
        paidAmount: paidAmt,
        balanceAmount: balanceAmt,
        dueDate: feeStruct.dueDate,
        status,
        remarks: discount > 0 ? 'Merit Scholarship Applied' : undefined,
      },
    });

    if (paidAmt > 0) {
      await prisma.payment.create({
        data: {
          invoiceNo: `HMS-REC-2026-${1000 + i}`,
          studentFeeId: sf.id,
          studentId: student.id,
          amount: paidAmt,
          paymentMethod: i % 2 === 0 ? 'UPI' : 'CARD',
          transactionRef: `HDFC-TXN-${Date.now()}-${i}`,
          paymentDate: new Date(2026, 7, 10 + (i % 5)),
          status: 'COMPLETED',
          remarks: 'Semester Fee Installment Paid Online',
          receivedById: accountant.id,
        },
      });
    }
  }

  console.log('✅ Seeded Fee structures, student fee ledgers, and payment receipts.');

  // ---------------------------------------------------------
  // 9. ATTENDANCE RECORDS (Past 7 Days)
  // ---------------------------------------------------------
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const attDate = new Date();
    attDate.setDate(attDate.getDate() - dayOffset);
    attDate.setHours(0, 0, 0, 0);

    for (let sIdx = 0; sIdx < 20; sIdx++) {
      const student = createdStudents[sIdx];
      const isMale = student.gender === 'MALE';
      const status = sIdx % 10 === 0 ? 'ABSENT' : sIdx % 8 === 0 ? 'LATE' : 'PRESENT';

      await prisma.attendance.create({
        data: {
          studentId: student.id,
          hostelId: isMale ? boysHostel.id : girlsHostel.id,
          date: attDate,
          status,
          checkInTime: status !== 'ABSENT' ? new Date(new Date(attDate).setHours(20, (sIdx * 3) % 55)) : null,
          markedById: isMale ? wardenBoys.id : wardenGirls.id,
        },
      });
    }
  }

  console.log('✅ Seeded 7-day student attendance logs.');

  // ---------------------------------------------------------
  // 10. LEAVES & GATE PASSES
  // ---------------------------------------------------------
  const leaveReasons = [
    { type: 'HOME_VISIT', reason: 'Sister wedding ceremony in hometown', status: 'APPROVED' },
    { type: 'MEDICAL', reason: 'Dental surgery and post-op rest', status: 'APPROVED' },
    { type: 'ACADEMIC', reason: 'Participating in Smart India Hackathon finals', status: 'APPROVED' },
    { type: 'EMERGENCY', reason: 'Family medical emergency', status: 'PENDING' },
    { type: 'HOME_VISIT', reason: 'Festival holidays with family', status: 'PENDING' },
  ];

  for (let i = 0; i < leaveReasons.length; i++) {
    const l = leaveReasons[i];
    await prisma.leaveRequest.create({
      data: {
        studentId: createdStudents[i].id,
        leaveType: l.type,
        startDate: new Date(2026, 7, 20 + i),
        endDate: new Date(2026, 7, 25 + i),
        reason: l.reason,
        emergencyPhone: '+91 9811223344',
        parentPhone: '+91 9811223355',
        status: l.status,
        wardenRemarks: l.status === 'APPROVED' ? 'Approved after parental confirmation call.' : undefined,
        approvedById: l.status === 'APPROVED' ? wardenBoys.id : null,
      },
    });
  }

  // Gate Passes
  for (let i = 0; i < 6; i++) {
    const passNo = `GP-2026-${1000 + i}`;
    const status = i === 0 ? 'ACTIVE' : i <= 2 ? 'APPROVED' : i === 3 ? 'RETURNED' : 'REQUESTED';
    await prisma.gatePass.create({
      data: {
        passNumber: passNo,
        studentId: createdStudents[i].id,
        purpose: i % 2 === 0 ? 'Project hardware component purchase' : 'Weekend coaching class',
        destination: 'Central Market Tech Plaza',
        departureDate: new Date(),
        departureTime: '17:30',
        expectedReturnDate: new Date(),
        expectedReturnTime: '21:30',
        actualReturnTime: status === 'RETURNED' ? new Date() : null,
        status,
        qrCode: `GP:${passNo}`,
        approvedById: status !== 'REQUESTED' ? wardenBoys.id : null,
      },
    });
  }

  // ---------------------------------------------------------
  // 11. VISITORS
  // ---------------------------------------------------------
  const visitorEntries = [
    { name: 'Dr. Ramesh Chandra', phone: '+91 9823412345', relation: 'FATHER', proof: 'AADHAAR', pNo: '8877 6655 4433', status: 'INSIDE' },
    { name: 'Kavita Deshmukh', phone: '+91 9823412346', relation: 'MOTHER', proof: 'AADHAAR', pNo: '1122 3344 5566', status: 'INSIDE' },
    { name: 'Sameer Singhal', phone: '+91 9823412347', relation: 'BROTHER', proof: 'DRIVING_LICENSE', pNo: 'DL-04-2018-9988', status: 'CHECKED_OUT' },
  ];

  for (let i = 0; i < visitorEntries.length; i++) {
    const v = visitorEntries[i];
    await prisma.visitor.create({
      data: {
        visitorName: v.name,
        phone: v.phone,
        idProofType: v.proof,
        idProofNumber: v.pNo,
        studentId: createdStudents[i].id,
        relation: v.relation,
        purpose: 'Semester family meetup & delivering care package',
        status: v.status,
        checkInTime: new Date(Date.now() - (i + 1) * 3600000),
        checkOutTime: v.status === 'CHECKED_OUT' ? new Date() : null,
        securityStaffId: securityStaff.id,
      },
    });
  }

  console.log('✅ Seeded Leaves, Gate Passes, and Visitor entries.');

  // ---------------------------------------------------------
  // 12. COMPLAINTS & MAINTENANCE
  // ---------------------------------------------------------
  const complaintsData = [
    { cat: 'ELECTRICAL', priority: 'HIGH', title: 'Ceiling fan making squeaking vibration noise', desc: 'The regulator is stuck at speed 5 and fan oscillates erratically.', status: 'IN_PROGRESS' },
    { cat: 'PLUMBING', priority: 'CRITICAL', title: 'Bathroom tap leaking continuously', desc: 'Water pressure in 2nd floor bathroom is low and main tap has a seal crack.', status: 'ASSIGNED' },
    { cat: 'INTERNET', priority: 'MEDIUM', title: 'Wi-Fi AP drop in Room 204', desc: 'Frequent packet drops during video calls and assignment uploads.', status: 'OPEN' },
    { cat: 'FURNITURE', priority: 'LOW', title: 'Study chair castor wheel broken', desc: 'One wheel broke off the swivel chair.', status: 'RESOLVED' },
  ];

  for (let i = 0; i < complaintsData.length; i++) {
    const c = complaintsData[i];
    const comp = await prisma.complaint.create({
      data: {
        ticketNo: `CMP-2026-${1000 + i}`,
        studentId: createdStudents[i].id,
        hostelId: boysHostel.id,
        category: c.cat,
        priority: c.priority,
        title: c.title,
        description: c.desc,
        status: c.status,
        assignedStaffId: c.status !== 'OPEN' ? maintenanceStaff.id : null,
        staffRemarks: c.status === 'RESOLVED' ? 'Replaced wheel assembly with heavy-duty model.' : 'Technician dispatched with spare parts.',
        resolutionDate: c.status === 'RESOLVED' ? new Date() : null,
      },
    });

    // Add comment
    await prisma.complaintComment.create({
      data: {
        complaintId: comp.id,
        userId: createdStudents[i].user.id,
        message: 'Kindly inspect this before Friday exams.',
      },
    });

    // Create Maintenance task for assigned complaints
    if (c.status !== 'OPEN') {
      await prisma.maintenanceTask.create({
        data: {
          taskNumber: `MT-2026-${1000 + i}`,
          complaintId: comp.id,
          hostelId: boysHostel.id,
          title: `Repair: ${c.title}`,
          description: c.desc,
          priority: c.priority,
          status: c.status === 'RESOLVED' ? 'COMPLETED' : 'IN_PROGRESS',
          assignedToId: maintenanceStaff.id,
          estimatedCost: 1200,
          actualCost: c.status === 'RESOLVED' ? 950 : 0,
          notes: 'Standard spares used from campus inventory.',
        },
      });
    }
  }

  // ---------------------------------------------------------
  // 13. WEEKLY MESS MENUS
  // ---------------------------------------------------------
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const menuTemplates = [
    { type: 'BREAKFAST', items: 'Masala Dosa, Sambar, Coconut Chutney, Boiled Eggs, Tea / Coffee', special: 'Filter Coffee', cal: 520 },
    { type: 'LUNCH', items: 'Paneer Butter Masala, Dal Tadka, Jeera Rice, Chapati, Fresh Green Salad, Curd', special: 'Gulab Jamun', cal: 780 },
    { type: 'SNACKS', items: 'Samosa, Mint Chutney, Veg Puff, Masala Chai', special: 'Hot Chai', cal: 340 },
    { type: 'DINNER', items: 'Kadhai Paneer / Butter Chicken, Yellow Dal, Phulka, Steamed Basmati Rice, Kheer', special: 'Ice Cream Cup', cal: 720 },
  ];

  for (const day of days) {
    for (const m of menuTemplates) {
      await prisma.messMenu.create({
        data: {
          hostelId: boysHostel.id,
          dayOfWeek: day,
          mealType: m.type,
          items: m.items,
          specialItem: m.special,
          calorieCount: m.cal,
          isActive: true,
        },
      });
    }
  }

  // ---------------------------------------------------------
  // 14. NOTICES & ANNOUNCEMENTS
  // ---------------------------------------------------------
  const noticesData = [
    { title: 'Annual Hostel Fest & Cultural Night 2026', content: 'Registrations are now open for inter-hostel cricket tournament, music band performance, and debate club.', cat: 'EVENT', prio: 'HIGH', target: 'ALL', pinned: true },
    { title: 'Semester Mess Fee Payment Due Date Reminder', content: 'All students are requested to clear their pending Spring 2026 semester dues by the end of this month to avoid late fee surcharges.', cat: 'MESS', prio: 'HIGH', target: 'ALL', pinned: true },
    { title: 'Scheduled Power Maintenance & Generator Test', content: 'There will be a brief 30-minute electricity switchover on Saturday morning from 10:00 AM to 10:30 AM.', cat: 'MAINTENANCE', prio: 'NORMAL', target: 'HOSTEL', pinned: false },
    { title: 'Night Curfew & Gate Pass Verification Protocol', content: 'Hostel main gates will close strictly at 10:00 PM. Any student returning late must present an approved digital gate pass to on-duty security officers.', cat: 'GENERAL', prio: 'HIGH', target: 'ALL', pinned: false },
  ];

  for (const n of noticesData) {
    await prisma.notice.create({
      data: {
        title: n.title,
        content: n.content,
        category: n.cat,
        priority: n.prio,
        targetAudience: n.target,
        isPinned: n.pinned,
        createdById: admin.id,
      },
    });
  }

  // ---------------------------------------------------------
  // 15. INITIAL NOTIFICATIONS & AUDIT LOGS
  // ---------------------------------------------------------
  await prisma.notification.create({
    data: {
      userId: superAdmin.id,
      title: 'System Initialized',
      message: 'Hostel Management System ERP successfully deployed with initial datasets.',
      type: 'SUCCESS',
      isRead: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      userEmail: superAdmin.email,
      userRole: superAdmin.role,
      action: 'INITIALIZE',
      module: 'SYSTEM',
      details: 'Initial system database setup and master seeder execution completed.',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('🎉 Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeder error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
