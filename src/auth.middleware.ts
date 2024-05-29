// auth.middleware.ts
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // Check if Authorization header is present
    //console.log("path", req.baseUrl)

    if (req.baseUrl === '/transactions/verify-payment') {
      // If it is, skip authentication and proceed to the next middleware
      return next();
    }
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    // Check if token is valid (for example, you might use JWT validation here)
    const [, token] = authHeader.split(' '); // Assuming format is Bearer <token>

    try {
      // Decode the token to extract payload
      const decodedToken = await this.jwtService.verifyAsync(token);

      // Check if the decoded token contains the email address
      if (!decodedToken || !decodedToken.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.userService.findOneByEmail(decodedToken.sub);

      if (!user) throw new UnauthorizedException('Invalid token');

      // Attach the email address to the request object for future use
      req.body.user = { ...decodedToken };

      //console.log(req.body)

      // If token is valid, proceed to the next middleware or route handler
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
