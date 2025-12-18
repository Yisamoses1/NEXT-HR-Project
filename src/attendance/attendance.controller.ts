import { Body, Controller, Patch, Post } from '@nestjs/common'
import { AttendanceService } from './attendance.service'
import { CreateAttendanceDto } from './dto/create-attendance.dto'
import { ClockOutDto } from './dto/clockOut.dto'

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('/')
  async createAttendance(@Body() payload: CreateAttendanceDto) {
    return await this.attendanceService.createAttendance(payload)
  }

  @Patch('/clock-out')
  async updateAttendance(@Body() payload: ClockOutDto){
    return await this.attendanceService.updateAttendance(payload)
  }
}
