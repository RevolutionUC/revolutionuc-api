import { Injectable, NestMiddleware } from '@nestjs/common';
import * as multer from 'multer';

@Injectable()
export class MulterMiddleware implements NestMiddleware {
  use = multer({ dest: './uploads' }).any()
}
