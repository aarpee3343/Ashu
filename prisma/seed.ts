const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔥 Clearing Database...");

  // 1. DELETE EVERYTHING (Strict Order to prevent Foreign Key Errors)
  // Delete tables that depend on Specialist first
  await prisma.payoutRequest.deleteMany(); 
  await prisma.bankAccount.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.slot.deleteMany();
  
  // Delete tables that depend on Booking/User
  await prisma.review.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.booking.deleteMany();
  
  // Delete User-dependent tables
  await prisma.vital.deleteMany();
  
  // Finally, delete the main Parent tables
  await prisma.specialist.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Database Cleared.");

  // 2. CREATE PASSWORD
  const password = await bcrypt.hash("password123", 10);

  // 3. CREATE USERS
  console.log("👤 Creating 1 Admin, 1 Patient, 1 Doctor...");

  // --- ADMIN ---
  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@test.com",
      password,
      role: "ADMIN",
    },
  });

  // --- PATIENT (User) ---
  const patient = await prisma.user.create({
    data: {
      name: "Test Patient",
      email: "patient@test.com",
      password,
      role: "USER",
      phone: "9876543210",
      address: "123, Test Street, Cyber City",
      gender: "Male",
      vitals: {
        create: [
          { type: "Blood Group", value: "O+" },
          { type: "Weight", value: "75 kg" }
        ]
      }
    },
  });

  // --- DOCTOR (Specialist) ---
  const doctorUser = await prisma.user.create({
    data: { 
      name: "Dr. Test Specialist", 
      email: "doctor@test.com", 
      password, 
      role: "SPECIALIST" 
    }
  });

  const specialist = await prisma.specialist.create({
    data: {
      userId: doctorUser.id,
      name: "Dr. Test Specialist",
      category: "PHYSIOTHERAPIST",
      bio: "Expert Physiotherapist for testing all platform features.",
      qualifications: "BPT, MPT",
      hospitals: "City Hospital",
      experience: 10,
      price: 500,
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
      isVerified: true,
      commissionRate: 20.0, // 20% Commission
      
      // Add a Bank Account so you can test Payouts immediately
      bankAccount: {
        create: {
          accountHolder: "Dr. Test Specialist",
          accountNumber: "1234567890",
          bankName: "HDFC Bank",
          ifscCode: "HDFC0001234"
        }
      },

      // Add a Clinic so you can test Clinic Visits
      clinics: {
        create: [
          { 
            name: "Test Wellness Clinic", 
            address: "Building A, Tech Park", 
            city: "Gurugram", 
            state: "Haryana", 
            pincode: "122001",
            district: "Gurugram"
          }
        ]
      }
    }
  });

  // 4. CREATE SLOTS (For the next 7 days)
  console.log("📅 Creating Availability Slots...");
  
  const today = new Date();
  const times = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];

  for (let i = 1; i <= 7; i++) { // Next 7 days
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    for (const time of times) {
      await prisma.slot.create({
        data: {
          specialistId: specialist.id,
          date: date,
          startTime: time,
          endTime: time, 
          isBooked: false
        }
      });
    }
  }

  console.log("🚀 Seed Completed Successfully!");
  console.log("-------------------------------------");
  console.log("👉 Patient: patient@test.com / password123");
  console.log("👉 Doctor:  doctor@test.com  / password123");
  console.log("-------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });