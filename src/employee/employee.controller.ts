import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags("Employee's account")
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create an employee's account" })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 401, description: 'Bad request' })
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(dto);
  }
}
