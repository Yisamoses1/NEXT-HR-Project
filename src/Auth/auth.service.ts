import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthDto } from './dto/createauthDto';
import * as argon from 'argon2';
import { ErrorHandler } from '../common/errorHandler.utils';
import { RefreshTokenDto } from './dto/refreshTokenDto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  async signin(authDto: CreateAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: authDto.email },
    });
    try {
      if (!user) {
        ErrorHandler.handle('Invalid credentials');
      }

      const isPasswordValid = await argon.verify(
        user.password,
        authDto.password,
      );
      if (!isPasswordValid) {
        ErrorHandler.handle('Invalid credentials');
      }

      const payload = { sub: user.id };

      // Use the secret from the ConfigService to sign the JWT
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'), // Using JWT secret from environment
        expiresIn: '1h',
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'), // Using JWT secret from environment
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
      console.log(error);
      ErrorHandler.handle(error);
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const storedToken = await this.prisma.token.findFirst({
      where: { userId: refreshTokenDto.userId, tokenType: 'Refresh_Token' },
    });

    if (!storedToken) {
      ErrorHandler.handle('Token not found');
    }

    const isTokenValid = await argon.verify(
      storedToken.token,
      refreshTokenDto.refreshToken,
    );

    if (!isTokenValid) {
      ErrorHandler.handle('Invalid refresh token');
    }

    const newAccessToken = this.jwtService.sign(
      { sub: refreshTokenDto.userId },
      { expiresIn: '30m' },
    );

    return {
      accessToken: newAccessToken,
    };
  }

  //   async changePassword(userId: string, changeDto: ChangePasswordDto) {
  //     //check if they userId is valid and exist on the database
  //     const user = await this.prisma.user.findUnique({ where: { id: userId } });
  //     if (!user) {
  //       throw new BadRequestException('User does not exist');
  //     }

  //     // verify the current password
  //     const isPasswordValid = await argon.verify(
  //       user.password,
  //       changeDto.currentPassword,
  //     );

  //     if (!isPasswordValid) {
  //       throw new BadRequestException('Invalid credentials');
  //     }

  //     // Make sure the new password and confirm password match
  //     if (changeDto.newPassword !== changeDto.confirmPassword) {
  //       throw new BadRequestException('Passwords do not match');
  //     }

  //     //hash the new password
  //     // const newPasswordHash = await argon.hash(changeDto.newPassword);

  //     // //update the password
  //     // const updatePassword = this.prisma.user.update({
  //     //   where: { id: userId },
  //     //   data: {
  //     //     password: newPasswordHash,
  //     //   },
  //     // });

  //     // // delete the old token
  //     // const oldToken = this.prisma.token.deleteMany({
  //     //   where: { id: userId },
  //     // });
  //     return {
  //       message: 'Password changed successfully',
  //     };
  //   }
  // }
}
