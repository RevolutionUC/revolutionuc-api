import { Body, Controller, Param, Post, Req, Res } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import {
  RegistrantDto,
  VerifyAttendanceDto as ConfirmAttendanceDto,
} from './dtos/Registrant.dto';

@ApiTags('registration')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('registrant')
  async register(@Body() registrant: RegistrantDto) {
    return this.appService.register(registrant);
  }
  @Post('uploadResume/:key')
  @ApiResponse({ status: 201, description: 'The file has been uploaded' })
  uploadResume(@Req() req, @Res() res, @Param('key') key: string) {
    // For some unknown reason the CORS middleware doesn't work with this route. A workaround is setting Fetch's `cors` option to `no-cors`
    // which allows you to upload the file with the drawback that you get an anymonomus response which is OK in this case.
    return this.appService.uploadResume(req, res, key);
  }
  @Post('confirmAttendance')
  async confirmAttendance(@Body() payload: ConfirmAttendanceDto) {
    return this.appService.confirmAttendance(payload);
  }
  @Post('verify/:key')
  @ApiParam({ name: 'Key', description: 'Key from email sent to registrant' })
  verify(@Param('key') key: string) {
    return this.appService.verify(key);
  }
}
