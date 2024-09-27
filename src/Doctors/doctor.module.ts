/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DoctorService } from './services/doctor.service';
import { DoctorSchema } from './schema/doctor.schema';
import { DoctorController } from './Controllers/doctor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { ApproveCheckMiddleware } from './middlwares/approve-check/approve-check.middleware'
import { availableTimeSchema } from './schema/availableTimes.schema';
import { AppointmentSchema } from 'src/Users/Schema/Appointment.Schema';


@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([{ name: 'Doctor', schema: DoctorSchema }]),
    MongooseModule.forFeature([{name:'availableTimes',schema:availableTimeSchema}]),
    MongooseModule.forFeature([{ name: 'Appointment', schema: AppointmentSchema }]),
   
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [DoctorService],
  controllers: [DoctorController],
})
export class DoctorModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApproveCheckMiddleware)
      .forRoutes({path:'doctors/Doctor-login',method: RequestMethod.POST}); 
  }
}
