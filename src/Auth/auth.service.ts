import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthDto } from './dto/createauthDto';
import * as argon from 'argon2';
import { ErrorHandler } from '../common/errorHandler.utils';
import { RefreshTokenDto } from './dto/refreshTokenDto';
import { ChangePasswordDto } from './dto/changePasswordDto';
import { ForgotPasswordDto } from './dto/forgotPasswordDto';
import { EmailService } from 'src/email/email.service';
import { ResetPasswordDto } from './dto/resetPasswordDto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async signin(authDto: CreateAuthDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: authDto.email },
        include: { MFA: true },
      });

      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      const isPasswordValid = await argon.verify(
        user.password,
        authDto.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid credentials');
      }

      if (user.MFA?.length > 0 && user.MFA[0].isVerified) {
        const otpCode = crypto.randomInt(100000, 999999).toString();

        await this.prisma.oTP.create({
          data: {
            userId: user.id,
            otp: otpCode,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
          },
        });

        await this.emailService.sendEmail({
          to: user.email,
          subject: 'MFA Verification Code',
          text: `Your MFA verification code is: ${otpCode}`,
        });

        return {
          message: 'MFA required. Enter the OTP sent to your email.',
          mfaRequired: true,
        };
      }

      const payload = { sub: user.id };
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '30d',
      });

      const hashedToken = await argon.hash(refreshToken);

      const existingToken = await this.prisma.token.findFirst({
        where: { userId: user.id, tokenType: 'Refresh_Token' },
      });

      if (existingToken) {
        await this.prisma.token.update({
          where: { id: existingToken.id },
          data: {
            token: hashedToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      } else {
        await this.prisma.token.create({
          data: {
            userId: user.id,
            token: hashedToken,
            tokenType: 'Refresh_Token',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }

      return {
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        tokens: {
          access: accessToken,
          refresh: refreshToken,
        },
      };
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const storedToken = await this.prisma.token.findFirst({
        where: { userId: refreshTokenDto.userId, tokenType: 'Refresh_Token' },
      });

      if (!storedToken) {
        throw new BadRequestException('Token not found');
      }

      const isTokenValid = await argon.verify(
        storedToken.token,
        refreshTokenDto.refreshToken,
      );

      if (!isTokenValid) {
        throw new BadRequestException('Invalid refresh token');
      }

      const newAccessToken = this.jwtService.sign(
        { sub: refreshTokenDto.userId },
        { expiresIn: '30m', secret: this.configService.get('JWT_SECRET') },
      );

      return {
        success: true,
        message: 'New access token generated',
        accessToken: newAccessToken,
      };
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }
  async changePassword(userId: string, changeDto: ChangePasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new UnauthorizedException('User does not exist');
      }
      const isPassword = await argon.verify(
        user.password,
        changeDto.currentPassword,
      );
      if (!isPassword) {
        throw new BadRequestException('Invalid credentials');
      }

      if (changeDto.newPassword !== changeDto.confirmPassword) {
        throw new BadRequestException('Password do not match');
      }

      const newPasswordHash = await argon.hash(changeDto.newPassword);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: newPasswordHash },
      });

      this.prisma.token.deleteMany({
        where: { id: userId },
      });

      return {
        messsage:
          'Password has been successfully changed, proceed to the login page.',
      };
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }

  async forgotPassword(forgotDto: ForgotPasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: forgotDto.email },
      });

      if (!user) {
        throw new BadRequestException('Email does not exist');
      }
      const payload = { sub: user.email };

      const token = await this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m',
      });
      const hashedToken = await argon.hash(token);
      await this.prisma.token.create({
        data: {
          userId: user.id,
          token: hashedToken,
          tokenType: 'RESET_PASSWORD',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Reset Password',
        text: `
          Hello ${user.firstName},

You requested to reset your password. Click the link below to reset it:

Reset Password: http://auth/reset-password?token=${token}

If you didn’t request this, ignore this email.

Best regards,  
Wilson's Team  
`,
      });
      return {
        message: 'Reset password link has been sent to the registered email.',
        token,
      };
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    try {
      const storedToken = await this.prisma.token.findFirst({
        where: { tokenType: 'RESET_PASSWORD' },
      });

      if (!storedToken) {
        throw new BadRequestException('Incorrect or expired token');
      }

      const payload = await this.jwtService.verifyAsync(resetDto.token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = this.prisma.user.findUnique({
        where: { email: payload.sub },
      });

      if (!user) {
        throw new BadRequestException('User does not exist');
      }

      if (resetDto.newPassword !== resetDto.confirmPassword) {
        throw new BadRequestException('Passwords do not match.');
      }
      const hashedPassword = await argon.hash(resetDto.newPassword);

      await this.prisma.user.update({
        where: { email: payload.sub },
        data: { password: hashedPassword },
      });

      await this.prisma.token.deleteMany({
        where: { userId: (await user).id, tokenType: 'RESET_PASSWORD' },
      });
      return {
        message: 'Password reset successfully',
      };
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }

  async enableMfa(userId: string) {
    try {
      const existingMfa = await this.prisma.mFA.findMany({ where: { userId } });

      const mfaSecret = crypto.randomBytes(20).toString('hex');

      if (existingMfa.length > 0) {
        await this.prisma.mFA.updateMany({
          where: { userId },
          data: { mfaSecret },
        });
      } else {
        await this.prisma.mFA.create({
          data: {
            userId,
            mfaSecret: crypto.randomBytes(20).toString('hex'),
            isVerified: false,
          },
        });
      }
      const otpCode = crypto.randomInt(100000, 999999).toString();

      await this.prisma.oTP.create({
        data: {
          user: { connect: { id: userId } },
          otp: otpCode,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          email: true,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Multi Factor Authentication (MFA) Enabled',
        text: ` 

      Hello ${user.firstName},

      You have enabled Multi-Factor Authentication (MFA) for your account.

      To complete the activation, please enter the following OTP:

      OTP Code: ${otpCode}

      This code will expire in 10 minutes.

      If you did not request this, please contact support immediately.

      Best regards,  
      Wilson's Team`,
      });
      return {
        message:
          'MFA enabled. An otp has been sent to your email for verification',
      };
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }

  async verifyMfa(userId: string, otpCode: string) {
    try {
      const otpRecord = await this.prisma.oTP.findFirst({
        where: { userId, otp: otpCode },
      });

      if (!otpRecord) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      await this.prisma.oTP.delete({ where: { id: otpRecord.id } });
      await this.prisma.mFA.updateMany({
        where: { userId },
        data: { isVerified: true },
      });
      const payload = { sub: userId };
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '30d',
      });

      return {
        message: 'MFA verified successfully!',
        tokens: { access: accessToken, refresh: refreshToken },
      };
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }
}
