import {
  Post,
  Body,
  Controller,
  Param,
  Get,
  Patch,
  UseGuards,
  Req,
  Res,
  Query,
  Put
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { RegistrantDto, SendEmailDto } from '../dtos/Registrant.dto';
import { Registrant, SortKey, SortOrder } from '../entities/registrant.entity';
import { AdminService } from '../admin/admin.service';
import { RoleGuard, Roles } from '../auth/role.guard';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('v2/admin')
@Roles([`SUDO`, `ADMIN`])
@UseGuards(AuthGuard(`jwt`), RoleGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('registrants')
  searchRegistrants(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sortKey') sortKey: SortKey,
    @Query('sortOrder') sortOrder: SortOrder,
    @Query('q') q: string
  ): Promise<Pagination<Registrant>> {
    return this.adminService.searchRegistrants(
      { page, limit },
      sortKey,
      sortOrder,
      q,
    );
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

  @Post('registrants/email')
  async sendEmail(@Body() payload: SendEmailDto) {
    return this.adminService.sendEmail(payload);
  }
}
