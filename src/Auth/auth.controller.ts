import {
  Controller,
  Post,
  Body,
  Patch,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateAuthDto } from './dto/createauthDto'
import { ChangePasswordDto } from './dto/changePasswordDto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { ForgotPasswordDto } from './dto/forgotPasswordDto'
import { ResetPasswordDto } from './dto/resetPasswordDto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @ApiOperation({ description: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Incorrect credentials' })
  async signin(@Body() authDto: CreateAuthDto) {
    return this.authService.signin(authDto)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @ApiOperation({ description: 'Change password' })
  @ApiResponse({
    status: 200,
    description: 'Password has been successfully updated',
  })
  @ApiResponse({ status: 400, description: 'Error updating password' })
  async changePassword(@Request() req, @Body() changeDto: ChangePasswordDto) {
    const userId = req.user.sub
    return this.authService.changePassword(userId, changeDto)
  }

  @Post('forgot-password')
  @ApiOperation({ description: 'Forgot password' })
  @ApiResponse({ status: 200, description: 'Check you mail to continue' })
  @ApiResponse({ status: 401, description: 'Incorrect credentials' })
  async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotDto)
  }
  @Post('reset-password')
  @ApiOperation({ description: 'Reset password' })
  @ApiResponse({
    status: 200,
    description: 'password reset successful, proceed to login',
  })
  @ApiResponse({ status: 400, description: 'Password reset not successful' })
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto)
  }

  @Post('enable')
  @ApiOperation({ description: 'Two Factor Authentication' })
  @ApiResponse({
    status: 200,
    description: 'Two Factor Authentication Successfully activated',
  })
  @ApiResponse({
    status: 401,
    description: 'Unable to activate two factor authentication',
  })
  async enableMfa(@Body('userId') userId: string, mfaType: 'OTP' | 'TOTP') {
    return await this.authService.enableMfa(userId, mfaType)
  }

  @Post('verify')
  @ApiOperation({ description: 'verify Two Factor Authentication' })
  @ApiResponse({
    status: 200,
    description: 'Two Factor Authentication sucessfully verified',
  })
  @ApiResponse({
    status: 401,
    description: 'Error verifying Two Factor Authentication',
  })
  async verifyMfa(
    @Body('userId') userId: string,
    @Body('otp') otpCode: string,
  ) {
    return await this.authService.verifyMfa(userId, otpCode)
  }
}
