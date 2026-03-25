const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tethered.com' },
    update: {},
    create: {
      email: 'admin@tethered.com',
      name: 'Site Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log({ admin });

  // Default Criteria
  const criteria = [
    { name: 'Innovation', maxScore: 10 },
    { name: 'Technical Complexity', maxScore: 10 },
    { name: 'Market Potential', maxScore: 10 },
    { name: 'Presentation', maxScore: 10 },
  ];

  for (const c of criteria) {
    await prisma.criterion.create({
      data: c,
    });
  }

  // Sample Submission
  await prisma.submission.create({
    data: {
      title: 'Tethered Health AI',
      description: 'AI-powered health monitoring for remote areas.',
      ownerName: 'Team Alpha',
      status: 'PENDING',
    }
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
