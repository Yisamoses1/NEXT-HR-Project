import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator"
import { Status } from "./statusEnum"
import { ContractType } from "./contractEnum"

export class CreateEmployeeDto {
    @IsString()
    @IsNotEmpty()
    department: string

    @IsString()
    @IsNotEmpty()
    position: string

    @IsString()
    @IsNotEmpty()
    salary: string

    @IsEnum(Status, {message: "Status must be ACTIVE, IN_ACTIVE, SUSPENDED OR TERMINATED"})
    status: Status
    
    @IsOptional()
    @IsUUID()
    managerId?: string

    @IsEnum(ContractType, {message: "Contract type must be FULL_TIME OR CONTRACT"})
    contractType: ContractType

    @IsString()
    @IsOptional()
    endDate?: string

    @IsString()
    @IsNotEmpty()
    staffId: string

    @IsString()
    @IsNotEmpty()
    startDate: string
}
