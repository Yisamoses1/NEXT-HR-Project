import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async signUp( dto: CreateUserDto) {
    //Check if the user already exist on the database
    const existingUser = await this.prisma.user.findUnique({where: {id: dto.employeeId}})
    if (existingUser) {
      throw new BadRequestException("User already exists")
    }
    //Check if the employee exists on the database or is correct
    const employee = await this.prisma.employee.findUnique({where: {id: dto.employeeId}})
    if (!employee) {
      throw new BadRequestException("Employee not found")
    }
    //Hash the password
    const hash = await argon.hash(dto.passwordHash)
    // Create the user
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          LastName: dto.lastName,
          passwordHash: hash,
          lastLogin: dto.lastLogin || null,
          employeeId: dto.employeeId,
          role: dto.role
        }
      })  
      // Return the user without the password
     const {passwordHash, ...result} = user
     return result;
     
    } catch (error) {
      console.log(error)
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