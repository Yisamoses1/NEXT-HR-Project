import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common'
import { EmployeeService } from './employee.service'
import { PaginationOptions } from 'src/utilities/pagination'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Employee')
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllEmployees(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: string,
    @Query('role') role?: string,
    @Query('department') department?: string,
    @Query('userId') userId?: string,
  ) {
    const pagination: PaginationOptions = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sort: sort ? JSON.parse(sort) : undefined,
    }

    const filter = {
      ...(role && { role }),
      ...(department && { department }),
    }

    const result = await this.employeeService.getAllEmployees(
      userId,
      pagination,
      filter,
    )

    return {
      message: 'Employees retrieved successfully',
      data: result,
      success: true,
    }
  }

  @Get('/:employeeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Bad Request' })
  async findOne(@Param('employeeId') employeeId: string) {
    return await this.employeeService.getEmployeeById(employeeId)
  }
}
