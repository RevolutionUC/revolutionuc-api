import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '../entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);

export class CurrentUserDto {
  id: string;
  role: Role;
}
