/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import { UserService } from '../Users/Services/user.service';
import { decode } from 'punycode';

@Injectable()
export class BlockUserMiddleware implements NestMiddleware {
  constructor(private userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    console.log('authHeader', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Ividemone');
      throw new UnauthorizedException(
        'Authorization token missing or malformed',
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: string;
      };
      req.user = decoded;
      console.log(decoded.userId);
      const user = await this.userService.findById(decoded.userId);
      if (user.isBlocked) {
        throw new ForbiddenException('User is blocked');
      }

      // If the user is not blocked, continue to the next middleware
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
