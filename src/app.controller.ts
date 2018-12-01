import { Post, Body, Controller, Param, Get, Patch, UseGuards, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { RegistrantDto } from './dtos/Registrant.dto';
import { Registrant, UploadKeyDto } from './entities/registrant.entity';
import { AdminGuard } from './admin.guard';
import { ApiImplicitParam, ApiResponse, ApiImplicitHeader } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('registrant')
  async register(@Body() registrant: RegistrantDto): Promise<UploadKeyDto> {
     return this.appService.register(registrant);
  }
  @Post('uploadResume/:key')
  @ApiResponse({status: 201, description: 'The file has been uploaded'})
  @ApiImplicitParam({name: 'Key', description: 'Key returned from /registrant'})
  async uploadResume(@Req() req, @Res() res, @Param('key') key: string) {
    return this.appService.uploadResume(req, res, key);
  }
  @Post('verify/:key')
  @ApiImplicitParam({ name: 'Key', description: 'Key from email sent to registrant' })
  verify(@Param('key') key: string) {
    return this.appService.verify(key);
  }
  @Get('admin/registrants')
  @ApiImplicitHeader({name: 'X-API-KEY'})
  @UseGuards(AdminGuard)
  async getRegistrants(): Promise<Registrant[]> {
    return await this.appService.getRegistrants();
  }
  @Patch('admin/registrants/:uuid/checkin')
  @ApiImplicitHeader({ name: 'X-API-KEY' })
  @UseGuards(AdminGuard)
  checkInRegistrant(@Param('uuid') uuid: string) {
    return this.appService.checkInRegistrant(uuid);
  }
}
