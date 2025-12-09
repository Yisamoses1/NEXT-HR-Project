import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string
}
