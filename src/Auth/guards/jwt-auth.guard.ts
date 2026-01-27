import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { TokenService } from 'src/token/token.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token missing or invalid.')
    }

    const token = authHeader.split(' ')[1]
    try {
      const payload = await this.tokenService.validateAccessToken(token)
      request.user = payload
      return true
    } catch (error) {
      throw new UnauthorizedException(error.message)
    }
  }
}
