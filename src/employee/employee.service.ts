<<<<<<< HEAD
import { BadRequestException, Injectable, Post } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}
  @Post()
  async createEmployee(dto: CreateEmployeeDto) {
    if (dto.managerId) {
      const manager = await this.prisma.employee.findUnique({
        where: { id: dto.managerId },
      });

      if (!manager) {
        throw new BadRequestException('Manager not found');
      }
    }

    //create the employee record

    const employee = this.prisma.employee.create({
      data: {
        staffId: dto.staffId,
        department: dto.department,
        position: dto.position,
        contractType: dto.contractType,
        salary: dto.salary,
        managerId: dto.managerId || null,
        status: dto.status,
        endDate: dto.endDate || null,
        startDate: dto.startDate,
      },
    });
    return employee;
  }
}
=======
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
 
>>>>>>> auth
