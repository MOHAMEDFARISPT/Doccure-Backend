/* eslint-disable @typescript-eslint/no-unused-vars */
import {
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

@Injectable()
@Injectable()
export class BlockUserMiddleware implements NestMiddleware {
  constructor(private userService: UserService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization token missing or malformed',
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('decoded.////////', decoded);
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
