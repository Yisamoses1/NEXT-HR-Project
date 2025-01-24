import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InviteUserDto } from './dto/invite-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PasswordUtil } from 'src/utilities/password.utils';
import * as argon from 'argon2';
import { SendMail } from 'src/utilities/mailHelper';
import { CreateEmployeeDto } from 'src/employee/dto';
 

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async inviteUser( employeeDto: CreateEmployeeDto, userDto: InviteUserDto ) {

      // Generate password and hash
      const randomPassword = PasswordUtil.generateRandomPassword(12);
      const passwordHash = await argon.hash(randomPassword);
    try {

    // create and user
    return await this.prisma.$transaction( async (tx) => {
      // check if email exists
      const existingUser = await this.prisma.user.findUnique({where: {email: userDto.email}});  

      if(existingUser) {
        throw new BadRequestException("Email already exists");
      }
    
      // create employee account
        const employee = await tx.employee.create({ 
         data: {
           staffId: employeeDto.staffId,
           department: employeeDto.department,
           position: employeeDto.position,
           startDate: employeeDto.startDate,
           salary: employeeDto.salary,
           status: employeeDto.status,
           contractType: employeeDto.contractType,
           managerId: employeeDto.managerId 
         }

        });

        if (!employee.id) {
          throw new Error('Employee ID was not generated'); 
        }
    //Create user account and remember it is also linked to the employee ID
    const newUser = await tx.user.create({
      data: {
        email: userDto.email,
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        password: passwordHash,
        role: userDto.role,
        employeeId: employee.id
      }
    });
    
     // Send email to the user
     const sendContent = 
     `Hello ${newUser.firstName},
     Your account has been created successfully.
     Your login details are:
     Username: ${newUser.email}
     password: ${randomPassword}
     You can change your password after logging in.
     Best regards
     Wilson's Team`;
 
     // send email to the user
     await SendMail(newUser.email, 'Account Created', sendContent);
     const { password, ...user } = newUser;
     return {
      employee,
       newUser
     }
  });
     
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
