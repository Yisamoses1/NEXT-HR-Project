import { Injectable } from '@nestjs/common'
import { CreateOtpDto } from './dto/create-otp.dto'
import prisma from 'src/lib/db'
import { OtpType } from './entities/otp-type.enum'
import { UserService } from 'src/user/user.service'

@Injectable()
export class OtpService {
  constructor(private readonly userService: UserService) {}
  private generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000)
    return code.toString()
  }

  async createCode(
    payload: Omit<CreateOtpDto, 'otp' | 'expiresAt'> & { userId: string },
  ): Promise<string> {
    const code = this.generateCode()
    const expiresAt = new Date().setMinutes(new Date().getMinutes() + 10)
    await this.deleteCode(payload.type, undefined, payload.userId)
    const createCode = await prisma.oTP.create({
      data: {
        ...payload,
        otp: code,
        expiresAt: new Date(expiresAt),
      },
    })
    return createCode ? code : null
  }

  async findAndVerifyCode(code: string, type: OtpType) {
    const verifiedCode = await prisma.oTP.findFirst({
      where: {
        otp: code,
        type: type,
      },
    })
    if (!verifiedCode) return null
    if (new Date() > verifiedCode.expiresAt) return null
    return verifiedCode
  }

  async deleteCode(
    type: OtpType,
    code?: string,
    userId?: string,
  ): Promise<boolean> {
    const where: any = {
      type,
      ...(code ? { otp: code } : {}),
      ...(userId ? { userId } : {}),
    }

    const deleted = await prisma.oTP.deleteMany({ where })

    return deleted.count > 0
  }

  async verifyCode(
    payload: Omit<CreateOtpDto, 'otp' | 'expires'> & { userId: string },
    code: string,
  ) {
    const user = await this.userService.findOne({ id: payload.userId })
    if (!user) {
      throw new Error('User not found')
    }
    const verifiedCode = await this.findAndVerifyCode(code, payload.type)
    if (!verifiedCode) {
      throw new Error('Invalid or expired code')
    }
    await this.deleteCode(payload.type, code, payload.userId)
    return true
  }
}
