import { BadRequestException, Injectable } from '@nestjs/common';
import { InviteUserDto } from './dto/invite-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordUtil } from 'src/utilities/password.utils';
import * as argon from 'argon2';
import { CreateEmployeeDto } from 'src/employee/dto';
import { EmailService } from 'src/email/email.service';
import { ErrorHandler } from 'src/common/errorHandler.utils';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async inviteUser(employeeDto: CreateEmployeeDto, userDto: InviteUserDto) {
    const randomPassword = PasswordUtil.generateRandomPassword(12);
    const passwordHash = await argon.hash(randomPassword);

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      return await this.prisma.$transaction(async (tx) => {
        const employee = await tx.employee.create({
          data: {
            staffId: employeeDto.staffId,
            department: employeeDto.department,
            position: employeeDto.position,
            startDate: employeeDto.startDate,
            salary: employeeDto.salary,
            status: employeeDto.status,
            contractType: employeeDto.contractType,
            managerId: employeeDto.managerId,
          },
        });

        //Create user account and remember it is also linked to the employee ID
        const newUser = await tx.user.create({
          data: {
            email: userDto.email,
            firstName: userDto.firstName,
            lastName: userDto.lastName,
            password: passwordHash,
            role: userDto.role,
            employeeId: employee.id,
          },
        });

        const { password, ...user } = newUser;

        await this.emailService.sendEmail({
          to: newUser.email,
          subject: 'Account Created',
          text: `
        Hello ${newUser.firstName},
        
        Your account has been created successfully.
        
        Your login details are:
        Username: ${newUser.email}
        Password: ${randomPassword}
        
        You can change your password after logging in.
        
        Best regards,
        Wilson's Team
      `,
        });

        return {
          user,
          employee,
        };
      });
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }
}
