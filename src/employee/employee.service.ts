import { BadRequestException, Injectable } from '@nestjs/common'
import prisma from '../lib/db'
import { PaginationOptions } from 'src/utilities/pagination'

@Injectable()
export class EmployeeService {
  constructor() {}
  async getAllEmployees(
    userId: string,
    pagination: PaginationOptions,
    filter?: { employeeRole?: string; department?: string },
  ) {
    const { page, limit } = pagination
    const { employeeRole, department } = filter || {}

    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { role: true },
    })

    if (!user) {
      throw new BadRequestException('User not found')
    }

    if (employeeRole && user.role !== employeeRole) {
      throw new BadRequestException('Access denied to this role')
    }
    const skip = (page - 1) * limit

    const [total, items] = await prisma.$transaction([
      prisma.employee.count({
        where: {
          ...(department && { department }),
          ...(employeeRole && { role: employeeRole }),
        },
      }),
      prisma.employee.findMany({
        where: {
          ...(department && { department }),
          ...(employeeRole && { role: employeeRole }),
        },
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
      }),
    ])

    return {
      meta: {
        total,
        page,
        limit,
      },
      items,
    }
  }

  async getEmployeeById(employeeId: string) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    })
    if (!employee) {
      throw new BadRequestException('Employee not found')
    }
    return employee
  }
}
