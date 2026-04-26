const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.onboardingStep.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.client.deleteMany();

  // Create demo client
  const hashedPassword = await bcrypt.hash('Demo@1234', 12);

  const demoClient = await prisma.client.create({
    data: {
      email: 'demo@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0100',
      company: 'Acme Corp',
      industry: 'Technology',
      country: 'US',
      status: 'IN_PROGRESS',
      emailVerified: true,
      profile: {
        create: {
          businessType: 'LLC',
          taxId: '12-3456789',
          website: 'https://acmecorp.example.com',
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          bio: 'Leading technology company focused on innovation.',
          annualRevenue: '1M-10M',
          employeeCount: '11-50',
        },
      },
      onboardingSteps: {
        create: [
          {
            stepNumber: 1,
            stepType: 'DOCUMENT_UPLOAD',
            title: 'Document Upload',
            description: 'Upload required identity and business documents',
            status: 'COMPLETED',
            completedAt: new Date(),
          },
          {
            stepNumber: 2,
            stepType: 'IDENTITY_VERIFICATION',
            title: 'Identity Verification',
            description: 'Verify your identity and business information',
            status: 'COMPLETED',
            completedAt: new Date(),
          },
          {
            stepNumber: 3,
            stepType: 'BUSINESS_SETUP',
            title: 'Business Setup',
            description: 'Configure your business profile and preferences',
            status: 'IN_PROGRESS',
          },
          {
            stepNumber: 4,
            stepType: 'REVIEW_AND_CONFIRM',
            title: 'Review & Confirm',
            description: 'Review all information and confirm onboarding',
            status: 'PENDING',
          },
        ],
      },
    },
  });

  // Create a second completed client
  const hashedPassword2 = await bcrypt.hash('Test@5678', 12);

  await prisma.client.create({
    data: {
      email: 'jane@example.com',
      password: hashedPassword2,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0200',
      company: 'Smith Consulting',
      industry: 'Finance',
      country: 'US',
      status: 'COMPLETED',
      emailVerified: true,
      profile: {
        create: {
          businessType: 'Corp',
          website: 'https://smithconsulting.example.com',
          city: 'New York',
          state: 'NY',
          annualRevenue: '500K-1M',
          employeeCount: '1-10',
        },
      },
      onboardingSteps: {
        create: [
          {
            stepNumber: 1,
            stepType: 'DOCUMENT_UPLOAD',
            title: 'Document Upload',
            description: 'Upload required identity and business documents',
            status: 'COMPLETED',
            completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            stepNumber: 2,
            stepType: 'IDENTITY_VERIFICATION',
            title: 'Identity Verification',
            description: 'Verify your identity and business information',
            status: 'COMPLETED',
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            stepNumber: 3,
            stepType: 'BUSINESS_SETUP',
            title: 'Business Setup',
            description: 'Configure your business profile and preferences',
            status: 'COMPLETED',
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            stepNumber: 4,
            stepType: 'REVIEW_AND_CONFIRM',
            title: 'Review & Confirm',
            description: 'Review all information and confirm onboarding',
            status: 'COMPLETED',
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Email: demo@example.com');
  console.log('  Password: Demo@1234');
  console.log('\n  Email: jane@example.com');
  console.log('  Password: Test@5678');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
