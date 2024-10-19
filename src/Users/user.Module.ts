/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule} from '@nestjs/jwt';
import {TemporaryUser, UserSchema } from './Schema/user.Schema';
import { UserController } from './controllers/user.controller';
import { UserService } from './Services/user.service';
import { ConfigModule } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { availableTimeSchema } from 'src/Doctors/schema/availableTimes.schema';
import { WalletSchema } from './Schema/Wallet.schema';
import { AppointmentSchema } from './Schema/Appointment.Schema'
import { JwtMiddleware } from '../middlewares/auth.middlware';
import { DoctorSchema } from 'src/Doctors/schema/doctor.schema';
import { specialityScheama } from 'src/Admin/Schema/speciality.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';




@Module({
  imports: [
    MongooseModule.forFeature([{ name:'User', schema: UserSchema }]),
    MongooseModule.forFeature([{name:'Tempuser',schema:TemporaryUser}]),
    MongooseModule.forFeature([{name:'availableTimes',schema:availableTimeSchema}]),
    MongooseModule.forFeature([{name:'wallet',schema:WalletSchema}]),
    MongooseModule.forFeature([{ name: 'Appointment', schema: AppointmentSchema }]),
    MongooseModule.forFeature([{ name: 'Patient', schema: UserSchema }]),
    MongooseModule.forFeature([{name:'speciality',schema:specialityScheama}]),
    MongooseModule.forFeature([{ name: 'Doctor', schema: DoctorSchema }]),

    ConfigModule.forRoot({
        envFilePath:'.env',
        isGlobal:true,
      }),
    JwtModule.register({
      secret:process.env.JWT_SECRET,
      signOptions: { expiresIn: '2d' }, 
    }),
  ],
  controllers: [UserController], 
  providers: [UserService,MailService,CloudinaryService], 
  exports:[UserService]
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {  
    consumer
      .apply(JwtMiddleware)   
      .exclude(              
        { path: 'users/login', method: RequestMethod.POST },
        { path: 'users/register', method: RequestMethod.POST },
        {path:'users/verify-Otp',method:RequestMethod.POST},
        {path:'users/resendOtp',method:RequestMethod.POST}
      )
      .forRoutes(UserController); 
  }
 

 
}
