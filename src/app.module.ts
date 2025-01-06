import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeeModule } from './employee/employee.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), PrismaModule, EmployeeModule, UserModule,  JwtModule.register({
    secret: process.env.JWT_SECRET || 'your_secret_key',
    signOptions: { expiresIn: '15m' }, // Access token expires in 15 minutes
  })],
  controllers: [],
  providers: [],
  exports: [JwtModule,]
})
export class AppModule {}
