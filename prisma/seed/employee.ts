import { Prisma } from 'src/generated/prisma/client'


export const seedEmployeeId = "6ad3ec0d-bfd2-4e15-b6fb-9cc36c4cfda8";
export function seedEmployees(): Prisma.EmployeeCreateManyInput[]  {
  return [
    {
      id: seedEmployeeId,
      department: 'IT',
      position: 'Software Engineer',
      startDate: new Date(),
      salary: new Prisma.Decimal(1000),
      contractType: 'FULL_TIME',
      staffId: 'EMP-001',
      status: 'ACTIVE',
      managerId: null,
      endDate: null,
    },
  ];
}
