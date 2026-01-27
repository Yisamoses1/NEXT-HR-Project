import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class ClockOutDto {
  @IsString({ message: 'Attendance ID must be a string' })
  @IsNotEmpty({ message: 'Attendance ID must not be empty' })
  attendanceId: string
  @IsNotEmpty()
  @IsString()
  @Matches(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i, {
    message: 'Time must be in format hh:mmam or hh:mmpm',
  })
  clockOut: string
}
