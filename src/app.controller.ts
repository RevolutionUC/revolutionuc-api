import { Post, Body, Controller, Param, Get, Patch, UseGuards,
         UseInterceptors, FileInterceptor, UploadedFile, HttpCode, HttpStatus, Req, Res, HttpException } from '@nestjs/common';
import { AppService } from 'app.service';
import { RegistrantDto } from 'dtos/registrant.dto';
import { Registrant } from 'entities/registrant.entity';
import { AdminGuard } from 'admin.guard';
import * as multer from 'multer';
import * as multers3 from 'multer-s3';
import * as aws from 'aws-sdk';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('registrant')
  async register(@Body() registrant: RegistrantDto): Promise<Registrant> {
    return await this.appService.register(registrant);
  }
  @Post('uploadResume/:uuid')
  async uploadResume(@Req() req, @Res() res, @Param('uuid') uuid) {
    const user = await this.appService.getUser(uuid);
    const email = user.email;
    const upload = multer({
      storage: multers3({
        s3: new aws.S3(),
        bucket: 'revolutionuc-resumes-2019',
        key: function (_req, file, cb) {
          const fileArray = file.originalname.split('.');
          const extension = fileArray[fileArray.length - 1];
          cb(null, `${email}.${extension}` );
        },
      }),
      limits: { fileSize: 20000000, files: 1 }
    });
    upload.single('resume')(req, res, err => {
      if (err) {
        throw new HttpException('There was an error uploading the resume', 500);
      }
      else {
        return HttpStatus.CREATED;
      }
    });
  }
  @Post('verify/:uuid')
  verify(@Param('uuid') uuid: string) {
    return this.appService.verify(uuid);
  }
  @Get('admin/registrants')
  @UseGuards(AdminGuard)
  async getRegistrants(): Promise<Registrant[]> {
    return await this.appService.getRegistrants();
  }
  @Patch('admin/registrants/:uuid/checkin')
  @UseGuards(AdminGuard)
  checkInRegistrant(@Param('uuid') uuid: string) {
    return this.appService.checkInRegistrant(uuid);
  }
}
