import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    console.log({ key: request.headers['x-api-key']});
    return request.headers['x-api-key'] === environment.API_KEY;
  }
}
