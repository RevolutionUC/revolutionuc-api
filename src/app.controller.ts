import {
  Post,
  Body,
  Controller,
  Param,
  Get,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  RegistrantDto,
  SendEmailDto,
  VerifyAttendanceDto as ConfirmAttendanceDto,
} from './dtos/Registrant.dto';
import { Registrant } from './entities/registrant.entity';
import { RoleGuard } from './auth/role.guard';
import { ApiParam, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { StatsDto } from './dtos/Stats.dto';

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
  @Get('admin/registrants')
  @ApiHeader({ name: 'X-API-KEY' })
  @UseGuards(RoleGuard)
  async getRegistrants(
    @Query('q') searchQuery: string,
    @Query('id') id: string,
    @Query('limit') limit: number,
  ): Promise<Registrant[] | Registrant> {
    return await this.appService.getRegistrants(searchQuery, id, limit);
  }
  @Get('admin/stats')
  @ApiHeader({ name: 'X-API-KEY' })
  @UseGuards(RoleGuard)
  async getStats(@Query('stats') inclduedStats: string): Promise<StatsDto> {
    return this.appService.getStats(inclduedStats);
  }
  @Post('admin/email')
  @ApiHeader({ name: 'X-API-KEY' })
  @UseGuards(RoleGuard)
  async sendEmail(@Body() payload: SendEmailDto) {
    return this.appService.sendEmail(payload);
  }

  @Get('admin/registrants/:uuid/checkin')
  @ApiHeader({ name: 'X-API-KEY' })
  @UseGuards(RoleGuard)
  checkInRegistrant(@Param('uuid') uuid: string) {
    return this.appService.checkInRegistrant(uuid);
  }

  @Get('admin/registrants/:uuid/checkout')
  @ApiHeader({ name: 'X-API-KEY' })
  @UseGuards(RoleGuard)
  checkOutRegistrant(@Param('uuid') uuid: string) {
    return this.appService.checkOutRegistrant(uuid);
  }
}
