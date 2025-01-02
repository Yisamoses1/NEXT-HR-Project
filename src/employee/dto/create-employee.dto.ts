import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator"
import { Status } from "./statusEnum"
import { ContractType } from "./contractEnum"
import { Transform } from "class-transformer"

export class CreateEmployeeDto {
    @IsString()
    @IsNotEmpty()
    department: string

    @IsString()
    @IsNotEmpty()
    position: string

   @Transform(({value}) => parseFloat(value))
   @IsNumber({maxDecimalPlaces: 2}, {message: "Amount must be a valid decimal number"})
    salary: number

    @IsEnum(Status, {message: "Status must be ACTIVE, INACTIVE, SUSPENDED OR TERMINATED"})
    status: Status
    
    @IsOptional()
    @IsUUID()
    managerId?: string

    @IsEnum(ContractType, {message: "Contract type must be FULL_TIME OR CONTRACT"})
    contractType: ContractType

    @IsOptional()
    @IsDateString({}, {message: "The date must be a valid ISO 8601 string (e.g., YYYY-MM-DD)" })
    endDate?: string

    @IsString()
    @IsNotEmpty()
    staffId: string

    @IsOptional()
    @IsNotEmpty()
    @IsDateString({}, {message: "The date must be a valid ISO 8601 string (e.g., YYYY-MM-DD)" })
    startDate: string
}
