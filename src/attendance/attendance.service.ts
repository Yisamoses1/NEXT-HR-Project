import { BadRequestException, Injectable } from '@nestjs/common'
import prisma from 'src/lib/db'
import { CreateAttendanceDto } from './dto/create-attendance.dto'
import { parseTime } from 'src/utilities/parseTime'
import { combineDateTime } from 'src/utilities/combineDateTime'
import { ClockOutDto } from './dto/clockOut.dto'
import { Prisma } from 'src/generated/prisma/client'
import { PaginationOptions } from 'src/utilities/pagination'

@Injectable()
export class AttendanceService {
  constructor() {}

  async createAttendance(payload: CreateAttendanceDto) {
    const employee = await prisma.employee.findUnique({
      where: { id: payload.employeeId },
      select: { status: true },
    })
    if (!employee) {
      throw new BadRequestException('Employee not found')
    }
    if (employee.status === 'INACTIVE' || employee.status === 'TERMINATED') {
      throw new BadRequestException(
        `Employee is not eligible to attendance: ${employee.status}`,
      )
    }
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: payload.employeeId,
        date: new Date(payload.date),
      },
    })
    const [hour, minute, ampm] = parseTime(payload.clockIn)
    const dateTime = combineDateTime(payload.date, hour, minute, ampm)

    if (attendance) {
      throw new BadRequestException('Attendance already taken for this date')
    }

    return await prisma.attendance.create({
      data: {
        employeeId: payload.employeeId,
        date: new Date(payload.date),
        clockInTime: dateTime,
      },
    })
  }
  async updateAttendance(payload: ClockOutDto) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: payload.attendanceId },
    })
    if (!attendance) {
      throw new BadRequestException('Invalid attendance id')
    }

    if (attendance.clockOutTime) {
      throw new BadRequestException('Employee already clocked put')
    }
    const clockInTime = attendance.clockInTime
    const [hour, minute, ampm] = parseTime(payload.clockOut)
    let dateTime = combineDateTime(
      attendance.date.toISOString().split('T')[0],
      hour,
      minute,
      ampm,
    )

    if (dateTime < clockInTime) {
      dateTime = new Date(dateTime)
      dateTime.setDate(dateTime.getDate() + 1)
    }

    const durationMs = dateTime.getTime() - clockInTime.getTime()

    if (durationMs <= 0) {
      throw new BadRequestException('Invalid clock out time')
    }

    const totalHours = Number((durationMs / (1000 * 60 * 60)).toFixed(2))
    const updateAttendance = await prisma.attendance.update({
      where: { id: payload.attendanceId },
      data: {
        clockOutTime: dateTime,
        totalHours: new Prisma.Decimal(totalHours),
      },
    })
    return updateAttendance
  }

  async getAttendance(
    pagination: PaginationOptions,
    filter?: { startDate?: string; endDate?: string; employeeId?: string },
  ) {
    const { limit, page, sort } = pagination
    const { startDate, endDate, employeeId } = filter ?? {}
    const query = {
      ...(employeeId && { employeeId }),
      ...((startDate || endDate) && {
        clockInTime: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }),
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        ...query,
      },
      orderBy: [
        { date: sort === 'asc' ? 'asc' : 'desc' },
        { clockInTime: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        clockInTime: true,
        clockOutTime: true,
        employeeId: true,
        date: true,
        totalHours: true,
      },
    })

    const attendanceCount = await prisma.attendance.count({
      where: query,
    })

    return {
      items: attendance,
      meta: {
        total: attendanceCount,
        page,
        limit,
      },
    }
  }
}
