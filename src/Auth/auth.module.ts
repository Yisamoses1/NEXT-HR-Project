import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [JwtModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
