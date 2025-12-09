import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UserModule } from './user/user.module'
import { JwtModule } from '@nestjs/jwt'
import { EmailModule } from './email/email.module'
import { AuthModule } from './Auth/auth.module'
import { EmployeeService } from './employee/employee.service'
import { EmployeeController } from './employee/employee.controller'
import { EmployeeModule } from './employee/employee.module'
import { TokenModule } from './token/token.module'
import { OtpModule } from './otp/otp.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EmailModule,
    AuthModule,

    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    EmployeeModule,
    TokenModule,
    OtpModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [JwtModule],
})
export class AppModule {}
