/* eslint-disable prettier/prettier */
import { Injectable, NestMiddleware,HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DoctorService } from 'src/Doctors/services/doctor.service';

@Injectable()
export class ApproveCheckMiddleware implements NestMiddleware {
  constructor(private readonly doctorService: DoctorService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;

    if (!email) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Email is required',
      });
    }

    try {
      const doctor = await this.doctorService.findByEmail(email);
      console.log("doctor",doctor)
      if (!doctor) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'You are not registered. Please register.',
        });
      }else{
        if (!doctor.personalDetails.isApproved) {
          return res.status(HttpStatus.FORBIDDEN).json({
            success: false,
            message: 'Your account is not approved yet.',
          });
        }
        console.log("nest will work")
        next(); // Pass control to the next middleware or route handler

      }

     
     
     
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'An unexpected error occurred',
      });
    }
  }
}

