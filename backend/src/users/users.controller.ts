import { Controller, Get, Put, Body, UnauthorizedException } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get('me')
  getMe() {
    if (process.env.DEV_AUTH_BYPASS === 'true') {
      return {
        _id: 'dev-user',
        email: 'dev@local',
        name: 'Dev User',
        role: 'admin',
      };
    }
    throw new UnauthorizedException();
  }

  @Put('me')
  updateMe(@Body() body: { name?: string; avatar?: string }) {
    if (process.env.DEV_AUTH_BYPASS === 'true') {
      return {
        _id: 'dev-user',
        email: 'dev@local',
        name: body.name ?? 'Dev User',
        avatar: body.avatar,
        role: 'admin',
      };
    }
    throw new UnauthorizedException();
  }
}

