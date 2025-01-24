import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
// import { EmployeeModule } from './employee/employee.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { LoginModule } from './login/login.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    // EmployeeModule,

    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get(process.env.JWT_SECRET),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    LoginModule
  ],
  controllers: [],
  providers: [],
  exports: [JwtModule],
})
export class AppModule {}
