import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [JwtModule, PrismaModule],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
