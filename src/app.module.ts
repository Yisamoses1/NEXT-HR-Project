import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeeModule } from './employee/employee.module';
import { UserModule } from './user/user.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), PrismaModule, EmployeeModule, UserModule,],
  controllers: [],
  providers: [],
})
export class AppModule {}
