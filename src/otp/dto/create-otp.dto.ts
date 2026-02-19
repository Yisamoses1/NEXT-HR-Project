import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { OtpType } from '../entities/otp-type.enum'

export class CreateOtpDto {
  otp: string
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(OtpType, {
    message:
      'Type must be EMAIL_VERIFICATION, FORGOT_PASSWORD or TWO_FACTOR_AUTHENTICATION',
  })
  type: OtpType
  expiresAt: Date
  @IsString({ message: 'UserId must be a string' })
  @IsNotEmpty({ message: 'UserId is required' })
  userId: string
}
