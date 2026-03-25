const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    console.log('USERS_IN_DB:', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('DATABASE_CHECK_ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
