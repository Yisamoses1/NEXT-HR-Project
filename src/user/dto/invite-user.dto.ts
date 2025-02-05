import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from './roleEum';
import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({ description: 'The email of the user' })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The firstname of the user' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'The lastname of the user' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'The employee ID' })
  @IsString()
  @IsOptional()
  employeeId: string;

  @ApiProperty({ description: 'The role of the user' })
  @IsNotEmpty()
  @IsEnum(Role, { message: 'Role must be ADMIN, EMPLOYEE, OR MANAGER' })
  role: Role;
}
