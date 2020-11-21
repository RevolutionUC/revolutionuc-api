import { ApiProperty } from "@nestjs/swagger"
import { Role, ROLES } from "../entities/user.entity"

export class UserDto {
  @ApiProperty()
  username: string

  @ApiProperty()
  password: string

  @ApiProperty({ enum: ROLES })
  role: Role
}

export class LoginDto {
  token: string
  user: Pick<UserDto, 'username' | 'role'>
}