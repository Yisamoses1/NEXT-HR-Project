import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InviteUserDto } from './dto/invite-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
// import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async inviteUser(dto: InviteUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // create employee and user
    // const {employeeDetails, ...userInfo} = dto

    // const employee = this.employeeService.createEmployee(employeeDetails);
    // const user = this.prisma.user.create({
    //   ...userInfo,
    //   employeeId: employee.id,
    // });

    //Hash the password
    // const randomPassword =  generateRandomPassword()
    // const hash = await argon.hash(dto.randomPassword);
    // Create the user
    try {
      // create employee and user
      // const {employeeDetails, ...userInfo} = dto

      // const employee = this.employeeService.createEmployee(employeeDetails);
      // const user = this.prisma.user.create({
      //   ...userInfo,
      //   employeeId: employee.id,
      // });
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          LastName: dto.lastName,
          passwordHash: hash,
          employeeId: dto.employeeId,
          role: dto.role,
        },
      });

      // todo: send email to the user
      return user;
    } catch (error) {
      console.log(error);
      // Handle Prisma unique constraint error
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken (e.g., email or employee ID conflict)',
          );
        }
      }
      // Re-throw the error if it is not a Prisma error
      throw error;
    }
  }
}
