import { Role } from "entities/user.entity"

export class UserDto {
  username: string
  password: string
  role: Role
}

export class CredentialsDto {
  username: string
  password: string
}