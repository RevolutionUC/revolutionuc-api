import {
  Post,
  Body,
  Controller,
  Param,
  Get,
  Patch,
  Req,
  Res,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { RegistrantDto } from '../dtos/Registrant.dto';
import { Registrant, SortKey, SortOrder } from '../entities/registrant.entity';
import { AdminService } from './admin.service';
import { EmailService, SendEmailDto } from '../email/email.service';
import { UseAuth } from '../auth/auth.decorator';

@ApiTags('admin')
@Controller('v2/admin')
@UseAuth([`SUDO`, `ADMIN`])
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly emailService: EmailService,
  ) {}

  @Get('registrants')
  searchRegistrants(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sortKey') sortKey: SortKey,
    @Query('sortOrder') sortOrder: SortOrder,
    @Query('q') q: string,
    @Query('full') full = `false`,
  ): Promise<Pagination<Registrant>> {
    return this.adminService.searchRegistrants(
      { page, limit },
      sortKey,
      sortOrder,
      q,
      full === `true`,
    );
  }

  @Get('checkedInCount')
  getCheckedInCount(): Promise<number> {
    return this.adminService.getCheckedInCount();
  }

  @Get('registrants/:uuid')
  getRegistrant(@Param('uuid') uuid: string): Promise<Registrant> {
    return this.adminService.getRegistrant(uuid);
  }

  @Patch('registrants/:uuid')
  updateRegistrant(
    @Param('uuid') uuid: string,
    @Body() data: Partial<RegistrantDto>,
  ): Promise<Registrant> {
    return this.adminService.updateRegistrant(uuid, data);
  }

  @Put('registrants/:uuid/resume')
  uploadResume(@Req() req, @Res() res, @Param('uuid') uuid: string) {
    return this.adminService.uploadResume(req, res, uuid);
  }

  @Post('registrants/:uuid/verify')
  verifyRegistrant(@Param('uuid') uuid: string): Promise<void> {
    return this.adminService.verifyRegistrant(uuid);
  }

  @Post('registrants/:uuid/checkin')
  checkInRegistrant(@Param('uuid') uuid: string): Promise<void> {
    return this.adminService.checkInRegistrant(uuid);
  }

  @Post('registrants/checkin')
  checkInRegistrantByEmail(@Query('email') email: string): Promise<Registrant> {
    return this.adminService.checkInRegistrantByEmail(email);
  }

  @Post('registrants/email')
  async sendEmail(@Body() payload: SendEmailDto) {
    return this.emailService.sendEmail(payload);
  }
}
