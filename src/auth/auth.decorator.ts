import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '../entities/user.entity';
import { RoleGuard, Roles } from '../auth/role.guard';
import { AuthGuard } from '@nestjs/passport';

export function UseAuth(roles?: Role[]) {
  if (roles?.length) {
    return applyDecorators(
      ApiBearerAuth(),
      Roles(roles),
      UseGuards(AuthGuard(`jwt`), RoleGuard),
    );
  }
  return applyDecorators(ApiBearerAuth(), UseGuards(AuthGuard(`jwt`)));
}
