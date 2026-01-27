import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import prisma from 'src/lib/db'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(userId: string, expiresIn: string, tokenType?: string) {
    const key = this.configService.get('JWT_SECRET')
    const token = this.jwtService.sign( { userId, tokenType } , { secret: key, expiresIn })
    return token
  }

  async deleteToken (code: string, userId: string, tokenType: string) {
    const where = {
      ...(code ? { token: code }: {}),
      ...(userId ? { userId}: {}),
      ...(tokenType ? {tokenType}: {})
    }
    const result = await prisma.token.deleteMany({ where })
    console.log(`${result.count} tokens deleted`)
    return result
  }

  async createAccessRefreshToken(userId: string) {
    const accessToken = await this.generateToken(userId, '7d', 'auth')
    const refreshToken = await this.generateToken(userId, '30d', 'refresh_token')
    await this.deleteToken(undefined, userId, 'refresh_token')

    const expiresIn = new Date()
    expiresIn.setDate(expiresIn.getDate() + 30)

    await prisma.token.create({
      data: {
      token: refreshToken,
      tokenType: 'refresh_token',
      user: {
        connect: {
          id: userId
        }
      },
      expiresAt: expiresIn
      }
    })
    return {
      accessToken,
      refreshToken
    }
  }

 async findAndVerifyToken(token: string, tokenType: string): Promise<any | null> {
  const findToken = await prisma.token.findFirst({ where: { token, tokenType} })
  if (!findToken) return null

  const secret = this.configService.get<string>('JWT_SECRET')

  try {
    return this.jwtService.verify(token, { secret })
  } catch {
    return null
  }
}
}
