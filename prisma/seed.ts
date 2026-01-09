// prisma/seed.ts
import { PrismaClient, Role, Category, BookingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional - be careful in production!)
  console.log('🗑️  Clearing existing data...');
  await prisma.$executeRaw`TRUNCATE TABLE "User", "Specialist", "Clinic", "Slot", "Booking", "Review", "Vital", "PayoutRequest", "BankAccount", "DailyLog" RESTART IDENTITY CASCADE`;

  // Hash passwords
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('password123', saltRounds);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const specialistPassword = await bcrypt.hash('specialist123', 10);

  // 1. Create Admin User
  console.log('👑 Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@healthcare.com',
      password: adminPassword,
      phone: '+911234567890',
      address: 'Admin Office, Healthcare HQ',
      gender: 'Male',
      role: Role.ADMIN,
    },
  });

  // 2. Create Regular Users
  console.log('👥 Creating regular users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Patient',
        email: 'john@example.com',
        password: hashedPassword,
        phone: '+919876543210',
        address: '123 Main St, Mumbai',
        gender: 'Male',
        role: Role.USER,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        password: hashedPassword,
        phone: '+919876543211',
        address: '456 Park Ave, Delhi',
        gender: 'Female',
        role: Role.USER,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Raj Kumar',
        email: 'raj@example.com',
        password: hashedPassword,
        phone: '+919876543212',
        address: '789 MG Road, Bangalore',
        gender: 'Male',
        role: Role.USER,
      },
    }),
  ]);

  // 3. Specialist data (without email - email is in User model)
  const specialistsData = [
    {
      name: 'Dr. Priya Sharma',
      category: Category.PHYSIOTHERAPIST,
      bio: 'Expert physiotherapist with 12 years of experience in sports injuries and rehabilitation. Certified in orthopedic manual therapy.',
      qualifications: 'MPT, Certified Orthopedic Manual Therapist',
      hospitals: 'Apollo Hospital, Max Healthcare',
      experience: 12,
      price: 1500,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
      isFeatured: true,
      isPopular: true,
      isVerified: true,
    },
    {
      name: 'Dr. Anil Patel',
      category: Category.NUTRITIONIST,
      bio: 'Clinical nutritionist specializing in diabetes management and weight loss programs. PhD in Nutritional Sciences.',
      qualifications: 'PhD, RD (Registered Dietitian)',
      hospitals: 'Fortis Hospital, AIIMS Delhi',
      experience: 8,
      price: 1200,
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400',
      isFeatured: true,
      isPopular: true,
      isVerified: true,
    },
    {
      name: 'Dr. Meena Reddy',
      category: Category.SPEECH_THERAPIST,
      bio: 'Pediatric speech therapist with expertise in autism spectrum disorders and language development delays.',
      qualifications: 'MASLP, Certified Autism Specialist',
      hospitals: 'Child Development Center, Rainbow Hospital',
      experience: 10,
      price: 1000,
      image: 'https://images.unsplash.com/photo-1594824434340-7e7dfc37cabb?w=400',
      isFeatured: false,
      isPopular: true,
      isVerified: true,
    },
    {
      name: 'Dr. Vikram Singh',
      category: Category.DIETITIAN,
      bio: 'Sports dietitian working with professional athletes. Specializes in performance nutrition and meal planning.',
      qualifications: 'MSc Sports Nutrition, CSSD',
      hospitals: 'Sports Authority of India, Olympic Training Center',
      experience: 6,
      price: 800,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
      isFeatured: false,
      isPopular: false,
      isVerified: true,
    },
  ];

  // Specialist emails (for User model)
  const specialistEmails = [
    'priya@physio.com',
    'anil@nutrition.com', 
    'meena@speech.com',
    'vikram@diet.com'
  ];

  console.log('👨‍⚕️ Creating specialists...');
  const specialists = await Promise.all(
    specialistsData.map(async (specData, index) => {
      // Create user for specialist
      const user = await prisma.user.create({
        data: {
          name: specData.name,
          email: specialistEmails[index],
          password: specialistPassword,
          phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`,
          address: 'Various clinics across city',
          gender: ['Male', 'Female'][index % 2], // Alternate gender
          role: Role.SPECIALIST,
        },
      });

      // Create specialist profile (without email field)
      const specialist = await prisma.specialist.create({
        data: {
          name: specData.name,
          category: specData.category,
          bio: specData.bio,
          qualifications: specData.qualifications,
          hospitals: specData.hospitals,
          experience: specData.experience,
          price: specData.price,
          image: specData.image,
          isFeatured: specData.isFeatured,
          isPopular: specData.isPopular,
          isVerified: specData.isVerified,
          userId: user.id,
          commissionRate: 20.0,
        },
      });

      return { user, specialist };
    })
  );

  // 4. Create Clinics for each specialist
  console.log('🏥 Creating clinics...');
  const clinics = await Promise.all(
    specialists.flatMap(({ specialist }) => [
      prisma.clinic.create({
        data: {
          specialistId: specialist.id,
          name: `${specialist.name}'s Clinic`,
          roomNumber: `Room ${Math.floor(Math.random() * 100) + 1}`,
          address: `${Math.floor(Math.random() * 1000) + 1} Medical Street`,
          district: ['South', 'North', 'Central'][Math.floor(Math.random() * 3)],
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '4000' + Math.floor(Math.random() * 100),
        },
      }),
      prisma.clinic.create({
        data: {
          specialistId: specialist.id,
          name: `${specialist.name}'s Second Clinic`,
          roomNumber: `Suite ${Math.floor(Math.random() * 50) + 1}`,
          address: `${Math.floor(Math.random() * 1000) + 1} Health Avenue`,
          district: ['West', 'East'][Math.floor(Math.random() * 2)],
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '4000' + Math.floor(Math.random() * 100),
        },
      }),
    ])
  );

  // 5. Create Slots for specialists
  console.log('⏰ Creating time slots...');
  const slots = [];
  const today = new Date();
  
  for (const { specialist } of specialists) {
    for (let i = 0; i < 7; i++) { // Next 7 days
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Create 4 slots per day
      const timeSlots = ['09:00', '11:00', '14:00', '16:00'];
      for (const startTime of timeSlots) {
        const endTime = `${parseInt(startTime.split(':')[0]) + 2}:00`;
        slots.push(
          prisma.slot.create({
            data: {
              specialistId: specialist.id,
              date: date,
              startTime,
              endTime,
              isBooked: Math.random() > 0.7, // 30% booked
            },
          })
        );
      }
    }
  }
  await Promise.all(slots);

  // 6. Create Bookings
  console.log('📅 Creating bookings...');
  const bookings = [];
  const statuses = [BookingStatus.UPCOMING, BookingStatus.COMPLETED, BookingStatus.CANCELLED];
  
  for (let i = 0; i < 15; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const { specialist } = specialists[Math.floor(Math.random() * specialists.length)];
    const clinic = clinics.find(c => c.specialistId === specialist.id);
    
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 10));
    
    bookings.push(
      prisma.booking.create({
        data: {
          userId: user.id,
          specialistId: specialist.id,
          clinicId: clinic?.id,
          date: bookingDate,
          slotTime: ['09:00', '11:00', '14:00', '16:00'][Math.floor(Math.random() * 4)],
          duration: [1, 2][Math.floor(Math.random() * 2)],
          locationType: ['CLINIC', 'HOME'][Math.floor(Math.random() * 2)],
          visitAddress: Math.random() > 0.5 ? `${Math.floor(Math.random() * 1000)} Patient St` : null,
          totalPrice: specialist.price,
          amountPaid: specialist.price,
          paymentType: ['PAY_ON_SERVICE', 'PAID'][Math.floor(Math.random() * 2)],
          platformFee: Math.floor(specialist.price * 0.1),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          medicalCondition: ['Back Pain', 'Diabetes Management', 'Speech Therapy', 'Nutrition Counseling'][Math.floor(Math.random() * 4)],
        },
      })
    );
  }
  const createdBookings = await Promise.all(bookings);

  // 7. Create Reviews for completed bookings
  console.log('⭐ Creating reviews...');
  const reviews = [];
  for (const booking of createdBookings.filter(b => b.status === BookingStatus.COMPLETED)) {
    reviews.push(
      prisma.review.create({
        data: {
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          comment: ['Great service!', 'Very professional', 'Helped a lot', 'Would recommend'][Math.floor(Math.random() * 4)],
          userId: booking.userId,
          specialistId: booking.specialistId,
          bookingId: booking.id,
        },
      })
    );
  }
  await Promise.all(reviews);

  // 8. Create Vitals for users
  console.log('❤️ Creating vitals data...');
  const vitals = [];
  for (const user of users) {
    vitals.push(
      prisma.vital.create({
        data: {
          userId: user.id,
          type: 'Blood Pressure',
          value: `${Math.floor(110 + Math.random() * 20)}/${Math.floor(70 + Math.random() * 10)}`,
        },
      }),
      prisma.vital.create({
        data: {
          userId: user.id,
          type: 'Heart Rate',
          value: `${Math.floor(65 + Math.random() * 20)} bpm`,
        },
      }),
      prisma.vital.create({
        data: {
          userId: user.id,
          type: 'Blood Sugar',
          value: `${Math.floor(80 + Math.random() * 40)} mg/dL`,
        },
      })
    );
  }
  await Promise.all(vitals);

  // 9. Create Bank Accounts for specialists
  console.log('🏦 Creating bank accounts...');
  for (const { specialist } of specialists) {
    await prisma.bankAccount.create({
      data: {
        specialistId: specialist.id,
        accountHolder: specialist.name,
        accountNumber: `1234567${Math.floor(1000 + Math.random() * 9000)}`,
        bankName: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'][Math.floor(Math.random() * 4)],
        ifscCode: `HDFC${Math.floor(100000 + Math.random() * 900000)}`,
      },
    });
  }

  // 10. Create Payout Requests
  console.log('💰 Creating payout requests...');
  for (const { specialist } of specialists) {
    await prisma.payoutRequest.create({
      data: {
        specialistId: specialist.id,
        amount: Math.floor(5000 + Math.random() * 20000),
        status: ['PENDING', 'PAID'][Math.floor(Math.random() * 2)],
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('=====================');
  console.log('👑 ADMIN:');
  console.log('  Email: admin@healthcare.com');
  console.log('  Password: admin123');
  console.log('\n👥 USERS:');
  console.log('  Email: john@example.com');
  console.log('  Email: sarah@example.com');
  console.log('  Email: raj@example.com');
  console.log('  Password for all users: password123');
  console.log('\n👨‍⚕️ SPECIALISTS:');
  console.log('  Email: priya@physio.com (Physiotherapist)');
  console.log('  Email: anil@nutrition.com (Nutritionist)');
  console.log('  Email: meena@speech.com (Speech Therapist)');
  console.log('  Email: vikram@diet.com (Dietitian)');
  console.log('  Password for all specialists: specialist123');
  
  // Show counts
  const userCount = await prisma.user.count();
  const specialistCount = await prisma.specialist.count();
  const bookingCount = await prisma.booking.count();
  
  console.log('\n📊 Database Statistics:');
  console.log('=====================');
  console.log(`Total Users: ${userCount}`);
  console.log(`Total Specialists: ${specialistCount}`);
  console.log(`Total Bookings: ${bookingCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });