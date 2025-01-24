import type { User } from '@prisma/client';
import * as argon from 'argon2';
import { seedEmployeeId } from './employee';

export async function seedUsers(): Promise<User[]> {
  return [
    {
      id: '7b232966-b90a-4382-8030-0138b013dfb2',
      firstName: 'Rasaq',
      lastName: 'Yisa',
      email: 'yisarasaq2018@gmail.com',
      password: await argon.hash('password'),
      role: 'ADMIN',
      employeeId: seedEmployeeId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}
