import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post("create")
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(dto)
  }    
  
}
