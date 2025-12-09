import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import prisma from 'src/lib/db'
import * as crypto from 'crypto'
import * as argon from 'argon2'
import { AccessTokenDto } from 'src/Auth/dto/accessToekn.Dto'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(userId: string) {
    return this.jwtService.sign(
      { sub: userId },
      { expiresIn: '1hr', secret: this.configService.get('JWT_SECRET') },
    )
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const plainToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = await argon.hash(plainToken)
    const existingToken = await prisma.token.findFirst({
      where: { userId, tokenType: 'refresh_token' },
    })
    if (existingToken) {
      await prisma.token.update({
        where: { id: existingToken.id },
        data: {
          token: hashedToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
    } else {
      await prisma.token.create({
        data: {
          userId,
          tokenType: 'refresh_token',
          token: hashedToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
    }
    return plainToken
  }

  async validateAccessToken(accessToken: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: this.configService.get('JWT_SECRET'),
      })
      return payload
    } catch (error) {
      throw new BadRequestException('Invalid or expired access token')
    }
  }

  async validateRefreshToken(userId: string, providedToken: string) {
    const storedToken = await prisma.token.findFirst({
      where: { userId, tokenType: 'Refresh_Token' },
    })

    if (!storedToken) {
      throw new BadRequestException('Refresh token not found')
    }

    const isValid = await argon.verify(storedToken.token, providedToken)
    if (!isValid) {
      throw new BadRequestException('Invalid refresh token')
    }

    if (storedToken.expiresAt < new Date()) {
      throw new BadRequestException('Refresh token expired')
    }

    return true
  }
}
