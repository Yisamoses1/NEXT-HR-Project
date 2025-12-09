import { Module } from '@nestjs/common'
import { TokenService } from './token.service'
import { TokenController } from './token.controller'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [JwtModule],
  controllers: [TokenController],
  providers: [TokenService, ConfigService],
  exports: [TokenService],
})
export class TokenModule {}
