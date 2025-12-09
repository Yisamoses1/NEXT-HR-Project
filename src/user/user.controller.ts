import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Get,
  Param,
} from '@nestjs/common'
import { UserService } from './user.service'
import { InviteUserDto } from './dto/invite-user.dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateEmployeeDto } from 'src/employee/dto'
import { PaginationOptions } from 'src/utilities/pagination'
import { Prisma } from 'src/generated/prisma/client'

@ApiTags('Authentication')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('invite-user')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 401, description: 'Bad Request' })
  async signUp(
    @Body('employee') employeeDto: CreateEmployeeDto,
    @Body('user') userDto: InviteUserDto,
  ) {
    return await this.userService.inviteUser(employeeDto, userDto)
  }
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: PaginationOptions) {
    const pagination = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sort: query.sort ?? 'asc',
    }
    const filter = query.filter ? JSON.parse(query.filter) : undefined
    const search = query.search ?? undefined

    return await this.userService.findAll(pagination, filter, search)
  }
  @Get('/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param() query: Partial<Prisma.UserWhereInput>) {
    return await this.userService.findOne(query)
  }
}
