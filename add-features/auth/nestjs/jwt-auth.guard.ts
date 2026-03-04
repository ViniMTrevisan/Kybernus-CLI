import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that protects routes using JWT authentication.
 * 
 * Usage: @UseGuards(JwtAuthGuard) on controller or route handler.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any) {
        if (err || !user) {
            throw err || new UnauthorizedException('Missing or invalid token');
        }
        return user;
    }
}
