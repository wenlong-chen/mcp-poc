import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BearerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    // This is a hardcoded token for demonstration purposes.
    // In a real application, you should use a secure way to manage secrets.
    const validToken = 'VERY_SECRET_TOKEN';

    if (token !== validToken) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
