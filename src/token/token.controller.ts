import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common'
import { TokenService } from './token.service'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Token')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('refresh_token')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({description: 'Create refersh token'})
  @ApiResponse({ status: 200, description: 'Refresh token generated successfully'})
  @ApiResponse({status: 400, description: 'Error generating refresh token'})
  async generateRefreshToken(@Body('userId') userId: string) {
    return this.tokenService.generateRefreshToken(userId)
  }
}
