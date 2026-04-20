import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (process.env.ADMIN_BYPASS_AUTH === 'true') return true;

    const req = context.switchToHttp().getRequest<Request & { headers: any }>();
    const provided = req.headers?.['x-admin-key'];
    const expected = process.env.ADMIN_API_KEY;
    if (!expected) {
      throw new UnauthorizedException('ADMIN_API_KEY is not configured');
    }
    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Unauthorized');
    }
    return true;
  }
}

