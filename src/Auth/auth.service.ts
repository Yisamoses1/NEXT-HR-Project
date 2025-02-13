import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthDto } from './dto/createauthDto';
import * as argon from 'argon2';
import { ErrorHandler } from '../common/errorHandler.utils';
import { RefreshTokenDto } from './dto/refreshTokenDto';
import { ChangePasswordDto } from './dto/changePasswordDto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, 
  ) {}

  async signin(authDto: CreateAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: authDto.email },
    });
    try {
      if (!user) {
        ErrorHandler.handle(new BadRequestException('Invalid credentials'));
      }

      const isPasswordValid = await argon.verify(
        user.password,
        authDto.password,
      );
      if (!isPasswordValid) {
        ErrorHandler.handle(new BadRequestException('Invalid credentials'));
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
        ErrorHandler.handle(new BadRequestException('Token not found'));
      }
  
      const isTokenValid = await argon.verify(
        storedToken.token,
        refreshTokenDto.refreshToken,
      );
  
      if (!isTokenValid) {
        ErrorHandler.handle(new BadRequestException('Invalid refresh token'));
      }
  
      const newAccessToken = this.jwtService.sign(
        { sub: refreshTokenDto.userId },
        { expiresIn: '30m',
          secret: this.configService.get('JWT_SECRET')
         },
        
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
      const user = await this.prisma.user.findUnique({where: {id: userId}});

    if(!user) {
      ErrorHandler.handle(new UnauthorizedException('User does not exist'));
    }
    const isPassword = await argon.verify(user.password, changeDto.currentPassword);
    if(!isPassword) {
      ErrorHandler.handle(new BadRequestException("Invalid credentials"))
    }

    if(changeDto.newPassword !== changeDto.confirmPassword){
      ErrorHandler.handle(new BadRequestException("Password do not match"));
    }

    const newPasswordHash = await argon.hash(changeDto.newPassword)

    await this.prisma.user.update({
      where: {id: userId},
      data: {password: newPasswordHash}
    })

    this.prisma.token.deleteMany({
      where: {id: userId}
    });

    return {
      messsage: "Password has been successfully changed, proceed to the login page."
    }
      
    } catch (error) {
      ErrorHandler.handle(error)
    }
      }

  }
