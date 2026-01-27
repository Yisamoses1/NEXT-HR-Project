import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { Status } from './statusEnum'
import { ContractType } from './contractEnum'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'The department of the employee irrespective of the role.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Department is required' })
  department: string

  @IsString()
  @IsNotEmpty({ message: 'Position is required' })
  @ApiProperty({
    description: 'The position of the employee in the organization.',
  })
  @IsString()
  @IsNotEmpty()
  position: string

  @ApiProperty({ description: 'The salary of the employee.' })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must be a valid decimal number.' },
  )
  @IsNotEmpty({ message: 'Salary is required' })
  salary: number

  @ApiProperty({
    description:
      'The status of the employee, be it ACTIVE, INACTIVE, SUSPENDED OT TERMINATED.',
  })
  @IsEnum(Status, {
    message: 'Status must be ACTIVE, INACTIVE, SUSPENDED OR TERMINATED.',
  })
  status: Status

  @ApiProperty({
    description:
      'The ID of the manager for employees that are neither the manager or an HR.',
  })
  @IsOptional()
  @IsUUID()
  managerId?: string

  @ApiProperty({
    description:
      'The type of contract, be it a FULL_TIME OR just on a CONTRACT.',
  })
  @IsEnum(ContractType, {
    message: 'Contract type must be FULL_TIME OR CONTRACT',
  })
  @IsNotEmpty({ message: 'Contract type is required' })
  contractType: ContractType

  @ApiProperty({
    description: 'The end date of the employee in format of YYY-MM-DD',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'The date must be a valid ISO 8601 string (e.g., YYYY-MM-DD).' },
  )
  @Transform(({ value }) => new Date(value).toISOString(), {
    toClassOnly: true,
  })
  endDate?: string

  @ApiProperty({ description: 'The staff ID of the employee' })
  @IsString()
  @IsNotEmpty({ message: 'Staff ID is required' })
  staffId: string

  @ApiProperty({
    description: 'The date at which the user was employed to the company',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Start date is required' })
  @IsDateString(
    {},
    { message: 'The date must be a valid ISO 8601 string (e.g., YYYY-MM-DD)' },
  )
  @Transform(({ value }) => new Date(value).toISOString(), {
    toClassOnly: true,
  })
  startDate: string
}
