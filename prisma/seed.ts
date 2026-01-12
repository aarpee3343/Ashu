import { PrismaClient, Role, Category, BookingStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// User credentials for all categories
const userCredentials = {
  // ADMIN User
  admin: {
    username: 'admin@example.com',
    password: 'Admin@123',
    role: Role.ADMIN
  },
  
  // Regular Users
  user1: {
    username: 'user1@example.com',
    password: 'User1@123',
    role: Role.USER
  },
  user2: {
    username: 'user2@example.com',
    password: 'User2@123',
    role: Role.USER
  },
  user3: {
    username: 'user3@example.com',
    password: 'User3@123',
    role: Role.USER
  },
  user4: {
    username: '+919876543210', // Phone user
    password: 'Phone@123',
    role: Role.USER
  },
  
  // Specialist Users
  physioSpecialist: {
    username: 'physio@example.com',
    password: 'Physio@123',
    role: Role.SPECIALIST
  },
  nutritionistSpecialist: {
    username: 'nutrition@example.com',
    password: 'Nutrition@123',
    role: Role.SPECIALIST
  },
  speechSpecialist: {
    username: 'speech@example.com',
    password: 'Speech@123',
    role: Role.SPECIALIST
  },
  dietitianSpecialist: {
    username: 'diet@example.com',
    password: 'Diet@123',
    role: Role.SPECIALIST
  }
};

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (be careful in production!)
  await prisma.verificationToken.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.vital.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.payoutRequest.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.specialist.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create users with hashed passwords
  const users = await Promise.all(
    Object.entries(userCredentials).map(async ([key, cred]) => {
      const hashedPassword = cred.password ? await hash(cred.password, 10) : null;
      const isEmail = cred.username.includes('@');
      
      return prisma.user.create({
        data: {
          name: key.charAt(0).toUpperCase() + key.slice(1),
          email: isEmail ? cred.username : null,
          phone: !isEmail ? cred.username : null,
          password: hashedPassword,
          role: cred.role,
          address: `Address for ${key}`,
          gender: ['Male', 'Female'][Math.floor(Math.random() * 2)],
          age: Math.floor(Math.random() * 50) + 20,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${key}`
        }
      });
    })
  );

  console.log(`✅ Created ${users.length} users`);

  // Find users by their role
  const adminUser = users.find(u => u.role === Role.ADMIN);
  const regularUsers = users.filter(u => u.role === Role.USER);
  const specialistUsers = users.filter(u => u.role === Role.SPECIALIST);

  // Create Specialists for each category
  const specialists = await Promise.all([
    // Physiotherapist
    prisma.specialist.create({
      data: {
        name: 'Dr. Rajesh Sharma',
        category: Category.PHYSIOTHERAPIST,
        bio: 'Expert in sports injuries and rehabilitation with 10+ years of experience.',
        qualifications: 'MPT (Ortho), Certified Sports Physiotherapist',
        hospitals: 'Apollo Hospitals, Fortis Healthcare',
        experience: 12,
        price: 1500,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=physio1',
        isFeatured: true,
        isPopular: true,
        isVideoAvailable: true,
        videoConsultationFee: 1200,
        isVerified: true,
        commissionRate: 20.0,
        userId: specialistUsers[0].id
      }
    }),
    // Physiotherapist 2
    prisma.specialist.create({
      data: {
        name: 'Dr. Priya Singh',
        category: Category.PHYSIOTHERAPIST,
        bio: 'Specialized in neuro rehabilitation and pediatric physiotherapy.',
        qualifications: 'BPT, NDT Certified',
        hospitals: 'Max Hospital, AIIMS',
        experience: 8,
        price: 1200,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=physio2',
        isFeatured: false,
        isPopular: true,
        isVideoAvailable: true,
        videoConsultationFee: 1000,
        isVerified: true,
        commissionRate: 18.0
      }
    }),

    // Nutritionist
    prisma.specialist.create({
      data: {
        name: 'Dr. Anjali Mehta',
        category: Category.NUTRITIONIST,
        bio: 'Weight management and diabetes specialist with holistic approach.',
        qualifications: 'M.Sc. Nutrition, RD',
        hospitals: 'Columbia Asia, Manipal Hospital',
        experience: 15,
        price: 2000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nutrition1',
        isFeatured: true,
        isPopular: false,
        isVideoAvailable: false,
        isVerified: true,
        commissionRate: 20.0,
        userId: specialistUsers[1].id
      }
    }),

    // Speech Therapist
    prisma.specialist.create({
      data: {
        name: 'Dr. Arjun Kapoor',
        category: Category.SPEECH_THERAPIST,
        bio: 'Expert in speech disorders for children and adults.',
        qualifications: 'MASLP, Certified Fluency Specialist',
        hospitals: 'Kokilaben Hospital, Hinduja Hospital',
        experience: 10,
        price: 1800,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=speech1',
        isFeatured: false,
        isPopular: true,
        isVideoAvailable: true,
        videoConsultationFee: 1500,
        isVerified: false,
        commissionRate: 22.0,
        userId: specialistUsers[2].id
      }
    }),

    // Dietitian
    prisma.specialist.create({
      data: {
        name: 'Dr. Sneha Reddy',
        category: Category.DIETITIAN,
        bio: 'Sports nutrition and clinical dietetics specialist.',
        qualifications: 'Ph.D. Nutrition, Sports Dietitian Certified',
        hospitals: 'NIMHANS, Narayana Health',
        experience: 7,
        price: 1600,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diet1',
        isFeatured: true,
        isPopular: false,
        isVideoAvailable: true,
        videoConsultationFee: 1400,
        isVerified: true,
        commissionRate: 19.5,
        userId: specialistUsers[3].id
      }
    }),
    // Dietitian 2
    prisma.specialist.create({
      data: {
        name: 'Dr. Vikram Patel',
        category: Category.DIETITIAN,
        bio: 'Specialized in geriatric nutrition and weight loss programs.',
        qualifications: 'M.Sc. Dietetics, CDE',
        hospitals: 'Global Hospital, Care Hospital',
        experience: 11,
        price: 1700,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diet2',
        isFeatured: false,
        isPopular: true,
        isVideoAvailable: false,
        isVerified: true,
        commissionRate: 21.0
      }
    })
  ]);

  console.log(`✅ Created ${specialists.length} specialists`);

  // Create Clinics for specialists
  const clinics = await Promise.all([
    // Clinics for Physiotherapist 1
    prisma.clinic.create({
      data: {
        specialistId: specialists[0].id,
        name: 'Apollo Physio Center',
        roomNumber: 'Room 101',
        address: '123 MG Road',
        district: 'Bangalore Central',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001'
      }
    }),
    prisma.clinic.create({
      data: {
        specialistId: specialists[0].id,
        name: 'Fortis Rehabilitation Wing',
        roomNumber: 'Wing B, Room 5',
        address: '456 Bannerghatta Road',
        district: 'South Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560076'
      }
    }),

    // Clinic for Nutritionist
    prisma.clinic.create({
      data: {
        specialistId: specialists[2].id,
        name: 'Columbia Nutrition Clinic',
        roomNumber: 'Consultation Room 3',
        address: '789 Whitefield Main Road',
        district: 'Whitefield',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560066'
      }
    }),

    // Clinic for Speech Therapist
    prisma.clinic.create({
      data: {
        specialistId: specialists[3].id,
        name: 'Kokilaben Speech Therapy',
        roomNumber: 'Speech Therapy Room',
        address: '321 Andheri West',
        district: 'Andheri',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053'
      }
    }),

    // Clinic for Dietitian
    prisma.clinic.create({
      data: {
        specialistId: specialists[4].id,
        name: 'Narayana Diet Center',
        roomNumber: 'Room 205',
        address: '654 Hosur Road',
        district: 'Bommanahalli',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560068'
      }
    })
  ]);

  console.log(`✅ Created ${clinics.length} clinics`);

  // Create Slots for specialists
  const slots = await Promise.all([
    // Slots for tomorrow
    ...Array.from({ length: 3 }).map((_, i) =>
      prisma.slot.create({
        data: {
          specialistId: specialists[0].id,
          date: new Date(Date.now() + 86400000), // Tomorrow
          startTime: `${9 + i}:00`,
          endTime: `${9 + i + 1}:00`,
          isBooked: i === 0 // First slot is booked
        }
      })
    ),
    ...Array.from({ length: 2 }).map((_, i) =>
      prisma.slot.create({
        data: {
          specialistId: specialists[2].id,
          date: new Date(Date.now() + 86400000),
          startTime: `${14 + i}:00`,
          endTime: `${14 + i + 1}:00`,
          isBooked: false
        }
      })
    ),
    // Slots for day after tomorrow
    ...Array.from({ length: 2 }).map((_, i) =>
      prisma.slot.create({
        data: {
          specialistId: specialists[3].id,
          date: new Date(Date.now() + 2 * 86400000),
          startTime: `${10 + i}:00`,
          endTime: `${10 + i + 1}:00`,
          isBooked: false
        }
      })
    )
  ]);

  console.log(`✅ Created ${slots.length} slots`);

  // Create Bookings
  const bookings = await Promise.all([
    // Completed booking with clinic visit
    prisma.booking.create({
      data: {
        userId: regularUsers[0].id,
        specialistId: specialists[0].id,
        date: new Date(Date.now() - 86400000), // Yesterday
        slotTime: '10:00-11:00',
        duration: 1,
        locationType: 'CLINIC',
        clinicId: clinics[0].id,
        totalPrice: 1500,
        amountPaid: 1500,
        paymentType: 'PAID',
        platformFee: 150,
        status: BookingStatus.COMPLETED,
        doctorNotes: 'Patient showed improvement in range of motion. Recommended exercises.',
        prescription: 'Ibuprofen 400mg as needed, Continue physio exercises',
        medicalCondition: 'Rotator cuff injury',
        medicalDocs: 'https://example.com/xray1.pdf'
      }
    }),
    // Upcoming booking with home visit
    prisma.booking.create({
      data: {
        userId: regularUsers[1].id,
        specialistId: specialists[2].id,
        date: new Date(Date.now() + 86400000), // Tomorrow
        slotTime: '14:00-15:00',
        duration: 1,
        locationType: 'HOME',
        visitAddress: '456 Park Street, Bangalore',
        totalPrice: 2000,
        amountPaid: 0,
        paymentType: 'PAY_ON_SERVICE',
        platformFee: 200,
        status: BookingStatus.UPCOMING,
        medicalCondition: 'Weight management consultation'
      }
    }),
    // Cancelled booking
    prisma.booking.create({
      data: {
        userId: regularUsers[2].id,
        specialistId: specialists[3].id,
        date: new Date(Date.now() - 2 * 86400000), // Two days ago
        slotTime: '11:00-12:00',
        duration: 1,
        locationType: 'CLINIC',
        clinicId: clinics[3].id,
        totalPrice: 1800,
        amountPaid: 0,
        paymentType: 'PAY_ON_SERVICE',
        platformFee: 180,
        status: BookingStatus.CANCELLED,
        medicalCondition: 'Speech therapy session'
      }
    }),
    // Video consultation booking
    prisma.booking.create({
      data: {
        userId: regularUsers[0].id,
        specialistId: specialists[4].id,
        date: new Date(Date.now() + 3 * 86400000), // Three days from now
        slotTime: '15:00-16:00',
        duration: 1,
        locationType: 'CLINIC', // Video consultations still use clinic as base
        clinicId: clinics[4].id,
        totalPrice: 1600,
        amountPaid: 1600,
        paymentType: 'PAID',
        platformFee: 160,
        status: BookingStatus.UPCOMING,
        medicalCondition: 'Diet planning for diabetes'
      }
    })
  ]);

  console.log(`✅ Created ${bookings.length} bookings`);

  // Create Daily Logs for completed booking
  const dailyLogs = await Promise.all([
    prisma.dailyLog.create({
      data: {
        bookingId: bookings[0].id,
        date: new Date(Date.now() - 86400000),
        status: 'COMPLETED',
        note: 'Initial assessment completed. Patient responded well to treatment.'
      }
    }),
    prisma.dailyLog.create({
      data: {
        bookingId: bookings[0].id,
        date: new Date(Date.now()),
        status: 'FOLLOW_UP',
        note: 'Follow-up exercises prescribed. Patient progress is good.'
      }
    }),
    prisma.dailyLog.create({
      data: {
        bookingId: bookings[1].id,
        date: new Date(Date.now() + 86400000),
        status: 'SCHEDULED',
        note: 'Upcoming home visit for nutrition consultation.'
      }
    })
  ]);

  console.log(`✅ Created ${dailyLogs.length} daily logs`);

  // Create Reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Excellent service! Dr. Sharma was very professional and helpful.',
        userId: regularUsers[0].id,
        specialistId: specialists[0].id,
        bookingId: bookings[0].id
      }
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Good advice, but waiting time was longer than expected.',
        userId: regularUsers[1].id,
        specialistId: specialists[2].id,
        bookingId: bookings[1].id
      }
    }),
    prisma.review.create({
      data: {
        rating: 3,
        comment: 'Average experience. Could be more thorough.',
        userId: regularUsers[2].id,
        specialistId: specialists[3].id,
        bookingId: bookings[2].id
      }
    })
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  // Create Vitals
  const vitals = await Promise.all([
    prisma.vital.create({
      data: {
        userId: regularUsers[0].id,
        type: 'BLOOD_PRESSURE',
        value: '120/80'
      }
    }),
    prisma.vital.create({
      data: {
        userId: regularUsers[0].id,
        type: 'BLOOD_SUGAR',
        value: '110 mg/dL'
      }
    }),
    prisma.vital.create({
      data: {
        userId: regularUsers[1].id,
        type: 'WEIGHT',
        value: '75 kg'
      }
    }),
    prisma.vital.create({
      data: {
        userId: regularUsers[2].id,
        type: 'HEART_RATE',
        value: '72 bpm'
      }
    })
  ]);

  console.log(`✅ Created ${vitals.length} vitals`);

  // Create Bank Accounts for specialists
  const bankAccounts = await Promise.all([
    prisma.bankAccount.create({
      data: {
        specialistId: specialists[0].id,
        accountHolder: 'Dr. Rajesh Sharma',
        accountNumber: '123456789012',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0001234'
      }
    }),
    prisma.bankAccount.create({
      data: {
        specialistId: specialists[2].id,
        accountHolder: 'Dr. Anjali Mehta',
        accountNumber: '987654321098',
        bankName: 'ICICI Bank',
        ifscCode: 'ICIC0009876'
      }
    }),
    prisma.bankAccount.create({
      data: {
        specialistId: specialists[4].id,
        accountHolder: 'Dr. Sneha Reddy',
        accountNumber: '456789012345',
        bankName: 'SBI',
        ifscCode: 'SBIN0004567'
      }
    })
  ]);

  console.log(`✅ Created ${bankAccounts.length} bank accounts`);

  // Create Payout Requests
  const payoutRequests = await Promise.all([
    prisma.payoutRequest.create({
      data: {
        specialistId: specialists[0].id,
        amount: 5000,
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 7 * 86400000) // 7 days ago
      }
    }),
    prisma.payoutRequest.create({
      data: {
        specialistId: specialists[0].id,
        amount: 7500,
        status: 'PENDING'
      }
    }),
    prisma.payoutRequest.create({
      data: {
        specialistId: specialists[2].id,
        amount: 3000,
        status: 'REJECTED',
        createdAt: new Date(Date.now() - 3 * 86400000) // 3 days ago
      }
    }),
    prisma.payoutRequest.create({
      data: {
        specialistId: specialists[4].id,
        amount: 4200,
        status: 'PENDING'
      }
    })
  ]);

  console.log(`✅ Created ${payoutRequests.length} payout requests`);

  // Create Accounts (Social Login) for some users
  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        userId: regularUsers[0].id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: 'google_123456',
        access_token: 'sample_access_token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'Bearer',
        scope: 'openid profile email'
      }
    }),
    prisma.account.create({
      data: {
        userId: regularUsers[1].id,
        type: 'oauth',
        provider: 'apple',
        providerAccountId: 'apple_789012',
        access_token: 'sample_access_token_apple',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'Bearer',
        scope: 'openid profile email'
      }
    })
  ]);

  console.log(`✅ Created ${accounts.length} social accounts`);

  // Create Sessions
  const sessions = await Promise.all([
    prisma.session.create({
      data: {
        sessionToken: 'session_token_1',
        userId: regularUsers[0].id,
        expires: new Date(Date.now() + 7 * 86400000) // 7 days from now
      }
    }),
    prisma.session.create({
      data: {
        sessionToken: 'session_token_2',
        userId: specialistUsers[0].id,
        expires: new Date(Date.now() + 7 * 86400000)
      }
    })
  ]);

  console.log(`✅ Created ${sessions.length} sessions`);

  // Create Verification Tokens
  const verificationTokens = await Promise.all([
    prisma.verificationToken.create({
      data: {
        identifier: 'user1@example.com',
        token: 'verification_token_123',
        expires: new Date(Date.now() + 24 * 3600000) // 24 hours
      }
    }),
    prisma.verificationToken.create({
      data: {
        identifier: 'physio@example.com',
        token: 'verification_token_456',
        expires: new Date(Date.now() + 24 * 3600000)
      }
    })
  ]);

  console.log(`✅ Created ${verificationTokens.length} verification tokens`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 User Credentials Summary:');
  console.log('===========================');
  
  Object.entries(userCredentials).forEach(([key, cred]) => {
    console.log(`${key}:`);
    console.log(`  Username/Email/Phone: ${cred.username}`);
    console.log(`  Password: ${cred.password}`);
    console.log(`  Role: ${cred.role}`);
    console.log('---');
  });

  console.log('\n📊 Seed Statistics:');
  console.log(`Total Users: ${users.length}`);
  console.log(`Total Specialists: ${specialists.length}`);
  console.log(`Total Bookings: ${bookings.length}`);
  console.log(`Total Reviews: ${reviews.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });