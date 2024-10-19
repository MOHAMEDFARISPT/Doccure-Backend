import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DoctorService } from 'src/Doctors/services/doctor.service';

@Injectable()
export class RegCancellationMiddelware implements NestMiddleware {
  constructor(private readonly doctorService: DoctorService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    console.log('Email provided:', req.path);

    // Check if email is provided
    if (!email) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Email is required',
      });
    }

    try {
      // Fetch doctor by email using the doctor service
      const doctor = await this.doctorService.findByEmail(email);

      // If doctor is not found
      if (!doctor) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'You are not registered. Please register.',
        });
      }

      // Check if registration is cancelled
      if (doctor.personalDetails.isRegCancelled) {
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          message: `Unfortunately, your registration was cancelled due to: ${doctor.personalDetails.regCancelReason}`,
        });
      }

      console.log('Registration check passed');
      next(); // Pass control to the next middleware or route handler
    } catch (error) {
      // Error handling if something goes wrong
      console.error('Error in RegCancellationMiddleware:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}
