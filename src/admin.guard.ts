import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { environment } from '../environments/environment';
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    if (request.headers['x-api-key'] === environment.API_KEY) {
      return true;
    }
    else {
      return false;
    }
  }
}
