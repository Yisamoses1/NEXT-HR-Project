import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InviteUserDto } from './dto/invite-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PasswordUtil } from 'src/utilities/password.utils';
import * as argon from 'argon2';
import { SendMail } from 'src/utilities/mailHelper';
import { CreateEmployeeDto } from 'src/employee/dto';
import { LoginDto } from './dto/loginDto';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto, RefreshTokenDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async inviteUser(employeeDto: CreateEmployeeDto, userDto: InviteUserDto) {
    const randomPassword = PasswordUtil.generateRandomPassword(12);
    const passwordHash = await argon.hash(randomPassword);
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const existingUser = await this.prisma.user.findUnique({
            where: { email: userDto.email },
          });

          if (existingUser) {
            throw new BadRequestException('Email already exists');
          }

          const employee = await tx.employee.create({
            data: {
              staffId: employeeDto.staffId,
              department: employeeDto.department,
              position: employeeDto.position,
              startDate: employeeDto.startDate,
              salary: employeeDto.salary,
              status: employeeDto.status,
              contractType: employeeDto.contractType,
              managerId: employeeDto.managerId,
            },
          });

          if (!employee.id) {
            throw new Error('Employee creation failed, Employee ID is missing');
          }

          const newUser = await tx.user.create({
            data: {
              email: userDto.email,
              firstName: userDto.firstName,
              lastName: userDto.lastName,
              password: passwordHash,
              role: userDto.role,
              employeeId: employee.id,
            },
          });

          const sendContent = `Hello ${newUser.firstName},
            Your account has been created successfully.
            Your login details are:
            Username: ${newUser.email}
            Password: ${randomPassword}
            You can change your password after logging in.
            Best regards
            Wilson's Team`;

          await SendMail(newUser.email, 'Account Created', sendContent);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...user } = newUser;
          return {
            employee,
            user,
          };
        },
        { timeout: 10000 },
      );
    } catch (error) {
      console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken (e.g., email or employee ID conflict)',
          );
        }
      }
      // Re-throw the error if it is not a Prisma error
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon.verify(
      user.password,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    const hashedToken = await argon.hash(refreshToken);

  await this. prisma.token.upsert({
    where: { userId: user.id || '', tokenType: 'Refresh_Token' },
    update: {
      token: hashedToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    create: {
      userId: user.id,
      token: hashedToken,
      tokenType: 'Refresh_token',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
   

  })
  // await this.prisma.token.create({
  //   data: {
  //     userId: user.id,
  //     token: hashedToken,
  //     tokenType: 'Refresh_Token',
  //     expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  //   },
  // })


  return {
    accessToken,
    refreshToken,
  };
}

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
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
      { expiresIn: '30m' },
    );

    return {
      accessToken: newAccessToken,
    };
  }

  async changePassword(userId: string, changeDto: ChangePasswordDto) {
    //check if they userId is valid and exist on the database
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    // verify the current password
    const isPasswordValid = await argon.verify(
      user.password,
      changeDto.currentPassword,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    // Make sure the new password and confirm password match
    if (changeDto.newPassword !== changeDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    //hash the new password
    // const newPasswordHash = await argon.hash(changeDto.newPassword);

    // //update the password
    // const updatePassword = this.prisma.user.update({
    //   where: { id: userId },
    //   data: {
    //     password: newPasswordHash,
    //   },
    // });

    // // delete the old token
    // const oldToken = this.prisma.token.deleteMany({
    //   where: { id: userId },
    // });
    return {
      message: 'Password changed successfully',
    };
  }
}
