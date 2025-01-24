import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateLoginDto } from './dto/create-login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';

@Injectable()
export class LoginService {
  constructor( private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}
  async Signin(loginDto: CreateLoginDto) {
    try {
      const user = await this.prisma.user.findUnique({where: {email: loginDto.email}});
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    //verify password
    const IspasswordValid = await argon.verify(user.password, loginDto.password);

    if (!IspasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    //Generate token 
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.sign(payload, {expiresIn: '1d'});
     // 3. Save the token in the database

     const expiresAt = new Date(Date.now() +24 * 3600 * 1000); // 1 day from now
     await this.prisma.token.create({
       data: {
          token,
         tokenType: 'Bearer',
         createdAt: new Date(),
         expiresAt,
       },
     });
      // Exclude password in the response
    const { password: _, ...userWithoutPassword } = user;

 
     // 4. Return the generated token
     return {
       accessToken: token,
       expiresAt,
        user: userWithoutPassword,
     };

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred while processing your request');
      console.log(error);
    }
      }
 } 
