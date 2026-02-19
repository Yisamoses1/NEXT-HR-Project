import { IsDateString, IsNotEmpty, IsString, Matches } from 'class-validator'

export class CreateAttendanceDto {
  @IsString({ message: 'Employee ID must be a string' })
  @IsNotEmpty({ message: 'Employee ID must not be empty' })
  employeeId: string

  @IsDateString({}, { message: 'date must be in YYYY-MM-DD format' })
  @IsNotEmpty({})
  date: string

  @IsNotEmpty()
  @IsString()
  @Matches(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i, {
    message: 'Time must be in format hh:mmam or hh:mmpm',
  })
  clockIn: string
}
