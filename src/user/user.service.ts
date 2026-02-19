import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { InviteUserDto } from './dto/invite-user.dto'
import prisma from '../lib/db'
import { PasswordUtil } from 'src/utilities/password.utils'
import * as argon from 'argon2'
import { CreateEmployeeDto } from 'src/employee/dto'
import { EmailService } from 'src/email/email.service'
import { Prisma, User } from 'src/generated/prisma/client'
import { PaginationOptions } from 'src/utilities/pagination'

@Injectable()
export class UserService {
  constructor(private readonly emailService: EmailService) {}

  async inviteUser(employeeDto: CreateEmployeeDto, userDto: InviteUserDto) {
    const randomPassword = PasswordUtil.generateRandomPassword(12)
    const passwordHash = await argon.hash(randomPassword)

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: userDto.email },
      })

      if (existingUser) {
        throw new BadRequestException('User already exists')
      }

      const { employee, user } = await prisma.$transaction(async (tx) => {
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
        })

        const newUser = await tx.user.create({
          data: {
            email: userDto.email,
            firstName: userDto.firstName,
            lastName: userDto.lastName,
            password: passwordHash,
            role: userDto.role,
            employeeId: employee.id,
          },
        })

        const { password, ...user } = newUser
        return {
          user,
          employee,
        }
      })
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Account Created',
        text: `
        Hello ${user.firstName},
        
        Your account has been created successfully.
        
        Your login details are:
        Username: ${user.email}
        Password: ${randomPassword}
        
        You can change your password after logging in.
        
        Best regards,
        Wilson's Team
      `,
      })

      return {
        user,
        employee,
      }
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException(error.message)
    }
  }

  async findOne(filter: Prisma.UserWhereInput) {
    return prisma.user.findFirst({
      where: filter,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  public async findAll(
    pagination: PaginationOptions,
    filter?: Partial<User>,
    search?: string,
  ) {
    const { limit, page, sort } = pagination

    const users = await prisma.user.findMany({
      where: {
        ...(filter ?? {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: {
        id: sort === 'asc' ? 'asc' : 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    })
    const userCount = await prisma.user.count({
      where: filter || {},
    })

    return {
      items: users,
      meta: {
        total: userCount,
        page,
        limit,
      },
    }
  }
}
