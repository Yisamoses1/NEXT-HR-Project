import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmployeeDto } from 'src/employee/dto';
import { LoginDto } from './dto/loginDto';
import { RefreshTokenDto } from './dto/refreshTokenDto';


 
@ApiTags('Authentication') // OpenAPI tag for the user controller
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('invite-user')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 401, description: 'Bad Request' })   
  async signUp( @Body('employee') employeeDto: CreateEmployeeDto,
    @Body('user') userDto: InviteUserDto
              ) { 
     return await this.userService.inviteUser( employeeDto, userDto );

}
@Post('login')
@HttpCode(HttpStatus.OK)
async login(@Body() loginDto: LoginDto) {
  return await this.userService.login(loginDto);
}



@Post('refresh-token')
async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
  return await this.userService.refreshToken(refreshTokenDto);
}
}