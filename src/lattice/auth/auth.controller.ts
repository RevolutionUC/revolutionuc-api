import { Controller, Get, Body, Post, Put, Param } from '@nestjs/common';
import { CurrentUser, CurrentUserDto } from 'src/auth/currentuser';
import { LatticeAuthService } from './auth.service';
import { LoginDTO, RegisterDTO, ChangePasswordDTO, ResetPasswordDTO } from './dtos';

@Controller(`v2/lattice/auth`)
export class LatticeAuthController {
  constructor(private readonly registrationService: LatticeAuthService) {}

  @Get(`email/:id`)
  getRegistrantEmail(@Param(`id`) registrantId: string): Promise<string> {
    console.log({registrantId});
    return this.registrationService.getRegistrantEmail(registrantId);
  }

  @Post(`register`)
  register(@Body() { registrantId, password }: RegisterDTO): Promise<string> {
    return this.registrationService.register(registrantId, password);
  }

  @Post(`login`)
  login(@Body() { email, password }: LoginDTO): Promise<string> {
    return this.registrationService.login(email, password);
  }

  @Post(`reset`)
  sendResetLink(@Body() { email }: Pick<LoginDTO, 'email'>): Promise<void> {
    return this.registrationService.sendResetLink(email);
  }

  @Get(`reset/:resetToken`)
  getResetInfo(@Param(`resetToken`) resetToken: string): Promise<string> {
    return this.registrationService.getResetInfo(resetToken);
  }

  @Put(`reset`)
  resetPassword(@Body() { resetToken, password }: ResetPasswordDTO): Promise<void> {
    return this.registrationService.resetPassword(resetToken, password);
  }

  @Put(`password`)
  changePassword(@CurrentUser() user: CurrentUserDto, @Body() { oldPassword, newPassword }: ChangePasswordDTO): Promise<void> {
    return this.registrationService.changePassword(user.id, oldPassword, newPassword);
  }
}
