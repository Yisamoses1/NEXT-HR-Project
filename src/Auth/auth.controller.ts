import { Controller, Post, Body, Patch, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/createauthDto';
import { ChangePasswordDto } from './dto/changePasswordDto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refreshTokenDto';
import { ForgotPasswordDto } from './dto/forgotPasswordDto';
import { ResetPasswordDto } from './dto/resetPasswordDto';

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
    @Post('forgot-password') 
    async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
      return this.authService.forgotPassword(forgotDto)    
}
    @Post('reset-password')
    async resetPassword(@Body() resetDto: ResetPasswordDto) {
      return this.authService.resetPassword(resetDto)
    }

}
 