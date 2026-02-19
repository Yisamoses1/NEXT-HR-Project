import { IsNotEmpty, IsString } from 'class-validator'

export class RefreshTokenDto {
  @IsNotEmpty() // Ensures the refresh token is not empty
  @IsString() // Ensures the refresh token is a string
  refreshToken: string

  @IsNotEmpty() // Ensures the user ID is not empty
  @IsString() // Ensures the user ID is a string
  userId: string
}
