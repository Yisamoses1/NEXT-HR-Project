import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtService],
  imports: [EmailModule],
})
export class UserModule {}
