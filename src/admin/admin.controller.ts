import { Post, Body, Controller, Param, Get, Patch, UseGuards, Req, Res, Query, Put } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { RegistrantDto } from '../dtos/Registrant.dto';
import { Registrant, SortKey, SortOrder } from '../entities/registrant.entity';
import { AdminGuard } from './admin.guard';
import { ApiImplicitHeader, ApiUseTags } from '@nestjs/swagger';
import { AdminService } from 'admin/admin.service';

@ApiUseTags('admin')
@Controller('v2/admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('registrants')
  @ApiImplicitHeader({ name: 'X-API-KEY' })
  searchRegistrants(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('sortKey') sortKey: SortKey,
    @Query('sortOrder') sortOrder: SortOrder,
    @Query('q') q: string
  ): Promise<Pagination<Registrant>> {
    return this.adminService.searchRegistrants({ page, limit }, sortKey, sortOrder, q);
  }

  @Get('registrants/:uuid')
  @ApiImplicitHeader({ name: 'X-API-KEY' })
  getRegistrant(@Param('uuid') uuid: string): Promise<Registrant> {
    return this.adminService.getRegistrant(uuid);
  }

  @Patch('registrants/:uuid')
  @ApiImplicitHeader({ name: 'X-API-KEY' })
  updateRegistrant(@Param('uuid') uuid: string, @Body() data: Partial<RegistrantDto>): Promise<Registrant> {
    return this.adminService.updateRegistrant(uuid, data);
  }

  @Put('registrants/:uuid/resume')
  @ApiImplicitHeader({ name: 'X-API-KEY' })
  uploadResume(@Req() req, @Res() res, @Param('uuid') uuid: string) {
    return this.adminService.uploadResume(req, res, uuid);
  }

  @Post('registrants/:uuid/verify')
  @ApiImplicitHeader({ name: 'X-API-KEY' })
  verifyRegistrant(@Param('uuid') uuid: string): Promise<void> {
    return this.adminService.verifyRegistrant(uuid);
  }

  @Post('registrants/:uuid/checkin')
  @ApiImplicitHeader({ name: 'X-API-KEY' })
  checkInRegistrant(@Param('uuid') uuid: string): Promise<void> {
    return this.adminService.checkInRegistrant(uuid);
  }
}
