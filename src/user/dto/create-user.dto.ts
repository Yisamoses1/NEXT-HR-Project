import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { Role } from "./roleEum"
import { Transform } from "class-transformer"

export class CreateUserDto {
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    firstName: string

    @IsString()
    @IsNotEmpty()
    lastName: string

    @IsString()
    @IsNotEmpty()
    passwordHash: string

    @IsDateString({}, {message: "The date must be a valid ISO 8601 string (e.g., YYYY-MM-DD)" })
    @Transform(({ value }) => new Date(value).toISOString(), { toClassOnly: true })
    @IsOptional()
    lastLogin: string

    @IsString()
    @IsNotEmpty()
    employeeId: string

    @IsNotEmpty()
    @IsEnum(Role, {message: "Role must be ADMIN, EMPLOYEE, OR MANAGER"})
    role: Role
}

