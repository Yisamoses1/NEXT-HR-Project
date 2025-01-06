import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("signup")
  async signUp(@Body() dto: CreateUserDto) {
    try {
      const newUser = await this.userService.signUp(dto)
      return{
        message: "User created successfully",
        user: newUser
      }
    } catch (error) {
      throw error;
    }
   
  }


}
