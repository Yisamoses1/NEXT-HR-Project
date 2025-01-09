import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { Role } from "./roleEum"
// import { Transform } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"

export class CreateUserDto {
    @ApiProperty({description: "The email of the user"})
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string

    @ApiProperty({description: "The firstname of the user"})
    @IsString()
    @IsNotEmpty()
    firstName: string

    @ApiProperty({description: "The lastname of the user"})
    @IsString()
    @IsNotEmpty()
    lastName: string

    @ApiProperty({description: "The password of tbhe user"})
    @IsString()
    @IsNotEmpty()
    passwordHash: string

    // @ApiProperty({description: "The last login of the user in the format YYYY-MM-DD"})
    // @IsDateString({}, {message: "The date must be a valid ISO 8601 string (e.g., YYYY-MM-DD)" })
    // @Transform(({ value }) => new Date(value).toISOString(), { toClassOnly: true })
    // @IsOptional()
    // lastLogin: string

    @ApiProperty({description: "The employee ID"})
    @IsString()
    @IsNotEmpty()
    employeeId: string

    @ApiProperty({description: "The role of the user"})
    @IsNotEmpty()
    @IsEnum(Role, {message: "Role must be ADMIN, EMPLOYEE, OR MANAGER"})
    role: Role
}

