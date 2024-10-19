import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../Users/Services/user.service';

@Injectable()
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private userService: UserService) {}
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Ethy ?', req.path);
    const authHeader = req.headers['authorization'];
    console.log('authorisation', authHeader);
    if (authHeader) {
      const token = authHeader.split(' ')[1];

      if (!token) {
        throw new HttpException('Token missing', HttpStatus.UNAUTHORIZED);
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('token und', decoded);
      next();
    } else {
      throw new HttpException('unAuthorised Access', HttpStatus.UNAUTHORIZED);
    }
  }
}
