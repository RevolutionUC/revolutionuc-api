import { ApiProperty } from '@nestjs/swagger';
import { Role, ROLES, User } from '../entities/user.entity';

export class UserDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ enum: ROLES })
  role: Role;
}

export class LoginDto {
  token: string;
  user: Pick<User, 'id' | 'username' | 'role'>;
}
