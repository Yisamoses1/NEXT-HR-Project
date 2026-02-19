import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import prisma from '../lib/db'
import { CreateAuthDto } from './dto/createauthDto'
import * as argon from 'argon2'
import { ErrorHandler } from '../common/errorHandler.utils'
import { ChangePasswordDto } from './dto/changePasswordDto'
import { ForgotPasswordDto } from './dto/forgotPasswordDto'
import { EmailService } from 'src/email/email.service'
import { ResetPasswordDto } from './dto/resetPasswordDto'
import qrcode from 'qrcode'
import * as speakeasy from 'speakeasy'
import { TokenService } from 'src/token/token.service'
import { OtpService } from 'src/otp/otp.service'
import { OtpType } from 'src/otp/entities/otp-type.enum'
import { GetEnvironMent } from 'src/utilities/get-environment'
import { decode } from 'punycode'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
  ) {}

  async signin(authDto: CreateAuthDto) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: authDto.email },
        include: { MFA: true },
      })

      if (!user) {
        throw new BadRequestException('Invalid credentials')
      }

      const isPasswordValid = await argon.verify(
        user.password,
        authDto.password,
      )
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid credentials')
      }

      const { password, ...userWithoutPassword } = user

      if (user.MFA?.length > 0 && user.MFA[0].isVerified) {
        const code = await this.otpService.createCode({
          type: OtpType.TWO_FACTOR_AUTHENTICATION,
          userId: user.id,
        })

        await this.emailService.sendEmail({
          to: user.email,
          subject: 'MFA Verification Code',
          text: `Your MFA verification code is: ${code} . This code will expire in 10 minutes.`,
        })
        return {
          message: 'MFA required. Enter the OTP sent to your email.',
          mfaRequired: true,
          user: userWithoutPassword,
        }
      }
      const tokenData = await this.tokenService.createAccessRefreshToken(user.id)
      const { accessToken, refreshToken } = tokenData

      return {
        message: 'Login successful.',
        mfaRequired: false,
        access_token: accessToken,
        refresh_token: refreshToken,
        user: userWithoutPassword,
      }
    } catch (error) {
      console.error
      throw new InternalServerErrorException(error.message)
      // ErrorHandler.handle(error)
    }
  }

  async changePassword(userId: string, changeDto: ChangePasswordDto) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } })

      if (!user) {
        throw new UnauthorizedException('User does not exist')
      }
      const isPassword = await argon.verify(
        user.password,
        changeDto.currentPassword,
      )
      if (!isPassword) {
        throw new BadRequestException('Invalid credentials')
      }

      if (changeDto.newPassword !== changeDto.confirmPassword) {
        throw new BadRequestException('Password do not match')
      }

      const newPasswordHash = await argon.hash(changeDto.newPassword)

      await prisma.user.update({
        where: { id: userId },
        data: { password: newPasswordHash },
      })

      prisma.token.deleteMany({
        where: { id: userId },
      })

      return {
        messsage:
          'Password has been successfully changed, proceed to the login page.',
      }
    } catch (error) {
      ErrorHandler.handle(error)
    }
  }

  async forgotPassword(forgotDto: ForgotPasswordDto) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: forgotDto.email },
      })

      if (!user) {
        throw new BadRequestException('Email does not exist')
      }
      const code = await this.otpService.createCode({
        type: OtpType.RESET_PASSWORD,
        userId: user.id,
      })
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Reset Password',
        text: `
          Hello ${user.firstName},

          You requested to reset your password. Click the link below to reset it:

          Reset Password: http://auth/reset-password?token=${code}

          If you didn’t request this, ignore this email.

          Best regards,  
          Wilson's Team  
          `,
      })

      const result = GetEnvironMent.isDevelopment() ? code : null

      return {
        message: 'Password reset instructions sent to your email.',
        resetCode: result,
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    try {
      const verifyCode = await this.otpService.findAndVerifyCode(
        resetDto.code,
        OtpType.RESET_PASSWORD,
      )

      if (!verifyCode) {
        throw new BadRequestException('Invalid or expired code')
      }

      await this.otpService.deleteCode(
        OtpType.RESET_PASSWORD,
        resetDto.code,
        verifyCode.userId,
      )

      const user = await prisma.user.findUnique({
        where: { id: verifyCode.userId },
      })

      if (!user) {
        throw new BadRequestException('User does not exist')
      }

      if (resetDto.newPassword !== resetDto.confirmPassword) {
        throw new BadRequestException('Passwords do not match.')
      }
      const hashedPassword = await argon.hash(resetDto.newPassword)

      await prisma.user.update({
        where: { id: verifyCode.userId },
        data: { password: hashedPassword },
      })
      return {
        message: 'Password reset successfully',
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async enableMfa(userId: string, mfaType: 'OTP' | 'TOTP') {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } })

      if (!user) {
        throw new BadRequestException('User does not exist')
      }
      const existingMfa = await prisma.mFA.findMany({ where: { userId } })
      if (existingMfa.length > 0) {
        throw new BadRequestException('MFA already enabled for this user')
      }

      if (mfaType === 'TOTP') {
        const secret = speakeasy.generateSecret({ length: 20 })
        const qrCodeImage = await qrcode.toDataURL(secret.otpauth_url)
        await prisma.mFA.create({
          data: {
            userId,
            mfaType,
            mfaSecret: secret.base32,
            isVerified: false,
            qrCodeUrl: qrCodeImage,
          },
        })
        return {
          message: 'MFA enabled. Scan the QR code to set up MFA.',
          qrCodeImage,
        }
      }
      const code = await this.otpService.createCode({
        type: OtpType.TWO_FACTOR_AUTHENTICATION,
        userId,
      })
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Multi-Factor Authentication (MFA) Code',
        text: `Your MFA OTP Code is: ${code}. This code expires in 10 minutes.`,
      })
      const otpCode = GetEnvironMent.isDevelopment() ? code : null

      return {
        message: 'MFA enabled. Use the OTP sent to your email.',
        otpCode,
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async verifyMfa(userId: string, code: string) {
    try {
      const mfaRecord = await prisma.mFA.findUnique({ where: { id: userId } })

      if (!mfaRecord) {
        throw new BadRequestException('MFA is not enabled for this user.')
      }

      let isValid = false

      if (mfaRecord.mfaType === 'TOTP') {
        isValid = speakeasy.totp.verify({
          secret: mfaRecord.mfaSecret!,
          encoding: 'base32',
          token: code,
          window: 1,
        })
      } else {
        const otpRecord = await this.otpService.findAndVerifyCode(
          code,
          OtpType.TWO_FACTOR_AUTHENTICATION,
        )
        if (otpRecord) {
          isValid = true
          await this.otpService.deleteCode(
            OtpType.TWO_FACTOR_AUTHENTICATION,
            code,
            userId,
          )
        }
      }
      if (!isValid) {
        throw new BadRequestException('Invalid or expired OTP')
      }

      await prisma.mFA.update({
        where: { id: userId },
        data: { isVerified: true },
      })

      const payload = { sub: userId }
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_ASECRET'),
        expiresIn: '1h',
      })

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '30d',
      })

      return {
        message: 'MFA verified successfully!',
        tokens: { access: accessToken, refresh: refreshToken },
      }
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
  async verifyAuthToken(token: string){
      const decodedToken = await this.tokenService.findAndVerifyToken(token, 'auth')
      if(!decodedToken) {
        throw new BadRequestException('Invalid or expired Token')
      }
      await this.tokenService.deleteToken(undefined, decodedToken.userId, 'auth')
      const user = await prisma.user.findUnique({ where: {id: decodedToken.userId}, select:{
        id: true,
        role: true,
        employeeId: true,
      }})
      if(!user) {
        throw new BadRequestException('Invalid or expired Token')
      }
      return user
    }
}
