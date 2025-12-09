import { Module } from '@nestjs/common'
import { OtpService } from './otp.service'
import { OtpController } from './otp.controller'
import { UserService } from 'src/user/user.service'
import { EmailModule } from 'src/email/email.module'

@Module({
  controllers: [OtpController],
  providers: [OtpService, UserService],
  exports: [],
  imports: [EmailModule],
})
export class OtpModule {}
