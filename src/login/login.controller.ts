import { Controller, Post, Body } from '@nestjs/common';
import { LoginService } from './login.service';
import { CreateLoginDto } from './dto/create-login.dto';

@Controller('users')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('signin')
  Signin(@Body() createLoginDto: CreateLoginDto) {
    return this.loginService.signin(createLoginDto);
  }
}
