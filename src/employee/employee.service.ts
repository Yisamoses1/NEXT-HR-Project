// import { BadRequestException, Injectable, Post } from '@nestjs/common';
// import { CreateEmployeeDto } from './dto/create-employee.dto';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class EmployeeService {
//   constructor(private readonly prisma: PrismaService) {}
//   async createEmployee( dto: CreateEmployeeDto) {
//    return this.prisma.$transaction(async (tx) => {
//    const newEmployee = await tx.employee.create({
//     data: {
//       staffId: dto.staffId ,
//       department: ,
//       position: ,
//       startDate: ,
//       salary: ,
//       status: ,
//       contractType: ,
//       managerId:
//     }
//   })
//     return { newEmployee }
//    })
// }
// }
