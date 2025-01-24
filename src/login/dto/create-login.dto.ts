import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateLoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
