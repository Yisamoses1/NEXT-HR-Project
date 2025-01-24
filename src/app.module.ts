import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
<<<<<<< HEAD
import { EmployeeModule } from './employee/employee.module';
=======
// import { EmployeeModule } from './employee/employee.module';
>>>>>>> auth
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
<<<<<<< HEAD
    EmployeeModule,
=======
    // EmployeeModule,
>>>>>>> auth
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [],
  providers: [],
  exports: [JwtModule],
})
export class AppModule {}
