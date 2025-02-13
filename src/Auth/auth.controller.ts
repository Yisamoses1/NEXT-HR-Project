import { Controller, Post, Body, Patch, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/createauthDto';
import { ChangePasswordDto } from './dto/changePasswordDto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signin(@Body() authDto: CreateAuthDto) {
    return this.authService.signin(authDto);
  }

  @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    async changePassword(@Request() req, @Body() changeDto: ChangePasswordDto) {
        const userId = req.user.sub;
        return this.authService.changePassword(userId, changeDto);
    }

    @Post('refresh-token')
    async refreshToken(@Body() refreshDto: RefreshTokenDto) {
      return this.authService.refreshToken(refreshDto)
    }

}
 