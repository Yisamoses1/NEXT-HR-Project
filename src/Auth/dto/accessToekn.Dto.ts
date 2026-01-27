import { IsNotEmpty, IsString } from 'class-validator'

export class AccessTokenDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string

  @IsNotEmpty()
  @IsString()
  userId: string
}
