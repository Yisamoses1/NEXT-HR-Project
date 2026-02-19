import { Module } from '@nestjs/common'
import { AttendanceService } from './attendance.service'
import { AttendanceController } from './attendance.controller'
import { EmployeeModule } from 'src/employee/employee.module'

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
  imports: [],
  exports: [],
})
export class AttendanceModule {}
