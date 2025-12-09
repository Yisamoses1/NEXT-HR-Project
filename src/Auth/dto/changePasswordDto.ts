import { IsNotEmpty, IsString } from 'class-validator'

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  currentPassword: string

  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  newPassword: string

  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsString()
  confirmPassword: string
}
