import { Controller, Get, Post, UnauthorizedException } from '@nestjs/common';

/**
 * Minimal endpoints to satisfy the existing frontend bootstrap flow.
 * Replace with your real auth implementation (JWT + refresh cookie) later.
 */
@Controller('auth')
export class AuthController {
  @Post('refresh')
  refresh() {
    if (process.env.DEV_AUTH_BYPASS === 'true') {
      return {
        token: 'dev-access-token',
        user: {
          _id: 'dev-user',
          email: 'dev@local',
          name: 'Dev User',
          role: 'admin',
        },
      };
    }
    throw new UnauthorizedException();
  }

  @Post('logout')
  logout() {
    return { ok: true };
  }

  @Post('change-password')
  changePassword() {
    throw new UnauthorizedException();
  }
}

