import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ErrorHandler } from 'src/common/errorHandler.utils';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization token missing or invalid.',
      );
    }

    const token = authHeader.split(' ')[1];

    const jwtSecret = this.configService.get('JWT_SECRET');
    if (!jwtSecret) {
      throw new UnauthorizedException(
        'Server misconfiguration: JWT Secret is missing.',
      );
    }

    try {
      const decoded = this.jwtService.verify(token, { secret: jwtSecret });

      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid token payload.');
      }

      request.user = decoded; // Attach user to request
      return true;
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }
}
