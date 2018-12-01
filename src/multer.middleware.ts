import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common';
import * as multer from 'multer';
import { NextFunction } from 'express';

@Injectable()
export class MulterMiddleware implements NestMiddleware {
  resolve(...args: any[]): MiddlewareFunction {
    return (req: Request | any, res: Response | any, next: NextFunction) => {
      multer({
        dest: './uploads'
      }).any()(req, res, next);
    };
  }
}
