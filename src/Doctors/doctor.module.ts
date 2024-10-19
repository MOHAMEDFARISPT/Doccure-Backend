/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DoctorService } from './services/doctor.service';
import { DoctorSchema } from './schema/doctor.schema';
import { DoctorController } from './Controllers/doctor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { availableTimeSchema } from './schema/availableTimes.schema';
import { AppointmentSchema } from 'src/Users/Schema/Appointment.Schema';
import { WalletSchema } from 'src/Users/Schema/Wallet.schema';
import { UserModule } from 'src/Users/user.Module';
import { JwtMiddleware } from 'src/middlewares/auth.middlware';
import { UserSchema } from 'src/Users/Schema/user.Schema';


@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([{ name: 'Doctor', schema: DoctorSchema }]),
    MongooseModule.forFeature([{name:'availableTimes',schema:availableTimeSchema}]),
    MongooseModule.forFeature([{ name: 'Appointment', schema: AppointmentSchema }]),
    MongooseModule.forFeature([{name:'wallet',schema:WalletSchema}]),
    MongooseModule.forFeature([{ name:'User', schema: UserSchema }]),
    UserModule,
   
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2d' },
    }),
  ],
  providers: [DoctorService],
  controllers: [DoctorController],
})
export class DoctorModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer

      .apply(JwtMiddleware)
      .exclude(
        { path: 'Doctors/Doctor-login', method: RequestMethod.POST },
        { path: 'Doctors/Doctor-Register', method: RequestMethod.POST },
        { path: 'Doctors/loadDoctorDatas', method: RequestMethod.GET },
      )
      .forRoutes(DoctorController)
    
    
  }
}
