import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { EmailService } from 'src/email/email.service'
import { TokenService } from 'src/token/token.service'
import { OtpService } from 'src/otp/otp.service'
import { UserService } from 'src/user/user.service'

@Module({
  imports: [JwtModule],
  controllers: [AuthController],
  providers: [AuthService, EmailService, TokenService, OtpService, UserService],
  exports: [AuthService],
})
export class AuthModule {}
