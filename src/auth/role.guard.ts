import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../entities/user.entity';
import { CurrentUserDTO } from './currentuser';

export const Roles = (roles: Role[]) => SetMetadata('roles', roles);

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user: CurrentUserDTO = req.user;
    const roles = this.reflector.get<Role[]>('roles', ctx.getClass());
    console.log({ roles });
    return roles.includes(user.role);
  }
}
