import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from './roleEum';
import { ApiProperty } from '@nestjs/swagger';

// model validator to acceot this data
// const payload = {
//   email: '',
//   firstName: '',
//   lastName: '',
//   role: '',
//   salary: "",
//   employeeDetails: {
//     department: '',
//     position: '',
//     startDate: '',
//     contractType: '',
//     staffId: ""
//   },
// };

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


  // @ApiProperty({description: "The last login of the user in the format YYYY-MM-DD"})
  // @IsDateString({}, {message: "The date must be a valid ISO 8601 string (e.g., YYYY-MM-DD)" })
  // @Transform(({ value }) => new Date(value).toISOString(), { toClassOnly: true })
  // @IsOptional()
  // lastLogin: string

  @ApiProperty({ description: 'The employee ID' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ description: 'The role of the user' })
  @IsNotEmpty()
  @IsEnum(Role, { message: 'Role must be ADMIN, EMPLOYEE, OR MANAGER' })
  role: Role;
}
