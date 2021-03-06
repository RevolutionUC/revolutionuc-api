import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../entities/user.entity';
import { CurrentUserDto } from './currentuser';

export const Roles = (roles: Role[]) => SetMetadata('roles', roles);

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user: CurrentUserDto = req.user;
    const roles = this.reflector.get<Role[]>('roles', ctx.getClass());
    return roles.includes(user.role);
  }
}
