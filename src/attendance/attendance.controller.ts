import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import { AttendanceService } from './attendance.service'
import { CreateAttendanceDto } from './dto/create-attendance.dto'
import { ClockOutDto } from './dto/clockOut.dto'
import {
  PaginationParams,
  resolvePagination,
} from 'src/utilities/resolve.pagination'
import { PaginationOptions } from 'src/utilities/pagination'

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('/')
  async createAttendance(@Body() payload: CreateAttendanceDto) {
    return await this.attendanceService.createAttendance(payload)
  }

  @Patch('/clock-out')
  async updateAttendance(@Body() payload: ClockOutDto) {
    return await this.attendanceService.updateAttendance(payload)
  }
  @Get('/')
  async getAttendance(@Req() req, @Query() query: Record<string, undefined>) {
    const { startDate, endDate, employeeId, ...paginationQuery } = query
    const pagination: PaginationOptions = {
      ...resolvePagination(paginationQuery),
    }
    const effectiveEmployeeId = req.user?.employeeId || employeeId
    return await this.attendanceService.getAttendance(pagination, {
      startDate,
      endDate,
      employeeId: effectiveEmployeeId,
    })
  }
}
