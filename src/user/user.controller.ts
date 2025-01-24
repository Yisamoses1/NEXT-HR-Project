import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmployeeDto } from 'src/employee/dto';

@ApiTags('Authentication') // OpenAPI tag for the user controller
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('invite-user')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 401, description: 'Bad Request' })   
  async signUp( @Body() employeeDto: CreateEmployeeDto,
    @Body() userDto: InviteUserDto
              ) { 
     return await this.userService.inviteUser( employeeDto, userDto );
  }
}
