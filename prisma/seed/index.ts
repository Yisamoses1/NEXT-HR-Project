import { seedUsers } from './user';
import { seedEmployees } from './employee';
import prisma from '../../src/lib/db'

(async () => {
  try {
    await Promise.all([prisma.user.deleteMany(), prisma.employee.deleteMany()]);
    await prisma.employee.createMany({
      data: seedEmployees(),
    });
    await prisma.user.createMany({
      data: await seedUsers(),
    });
    console.log('Seed data successfully.');
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
