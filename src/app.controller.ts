import { Post, Body, Controller, Param, Get, Patch, UseGuards, Req, Res, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { RegistrantDto, SendEmailDto, VerifyAttendanceDto as ConfirmAttendanceDto } from './dtos/Registrant.dto';
import { Registrant, UploadKeyDto } from './entities/registrant.entity';
import { AdminGuard } from './admin.guard';
import { ApiImplicitParam, ApiResponse, ApiImplicitHeader } from '@nestjs/swagger';
import { StatsDto } from './dtos/Stats.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('registrant')
  async register(@Body() registrant: RegistrantDto): Promise<object> {
     return this.appService.register(registrant);
  }
  @Post('uploadResume/:key')
  @ApiResponse({status: 201, description: 'The file has been uploaded'})
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
  @ApiImplicitParam({ name: 'Key', description: 'Key from email sent to registrant' })
  verify(@Param('key') key: string) {
    return this.appService.verify(key);
  }
  @Get('admin/registrants')
  @ApiImplicitHeader({name: 'X-API-KEY'})
  @UseGuards(AdminGuard)
  async getRegistrants(@Query('q') searchQuery: string, @Query('id') id: string,
                       @Query('limit') limit: number): Promise<Registrant[] | Registrant> {
    return await this.appService.getRegistrants(searchQuery, id, limit);
  }
  @Get('admin/stats')
  @ApiImplicitHeader({name: 'X-API-KEY'})
  @UseGuards(AdminGuard)
  async getStats(@Query('stats') inclduedStats: string): Promise<StatsDto> {
    return this.appService.getStats(inclduedStats);
  }
  @Post('admin/email')
  @ApiImplicitHeader({ name: 'X-API-KEY' })
  @UseGuards(AdminGuard)
  async sendEmail(@Body() payload: SendEmailDto) {
    return this.appService.sendEmail(payload);
  }

  @Get('admin/registrants/:uuid/checkin')
  @ApiImplicitHeader({ name: 'X-API-KEY' })
  @UseGuards(AdminGuard)
  checkInRegistrant(@Param('uuid') uuid: string) {
    return this.appService.checkInRegistrant(uuid);
  }
}
