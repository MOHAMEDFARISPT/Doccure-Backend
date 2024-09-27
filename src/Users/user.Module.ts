/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule} from '@nestjs/jwt';

import {TemporaryUser, UserSchema } from './Schema/user.Schema';
import { UserController } from './controllers/user.controller';
import { UserService } from './Services/user.service';
import { ConfigModule } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { JwtMiddleware } from './middlwares/auth.middlware';
import { availableTimeSchema } from 'src/Doctors/schema/availableTimes.schema';
import { WalletSchema } from './Schema/Wallet.schema';
import { AppointmentSchema } from './Schema/Appointment.Schema'


@Module({
  imports: [
    MongooseModule.forFeature([{ name:'User', schema: UserSchema }]),
    MongooseModule.forFeature([{name:'Tempuser',schema:TemporaryUser}]),
    MongooseModule.forFeature([{name:'availableTimes',schema:availableTimeSchema}]),
    MongooseModule.forFeature([{name:'wallet',schema:WalletSchema}]),
    MongooseModule.forFeature([{ name: 'Appointment', schema: AppointmentSchema }]),
    MongooseModule.forFeature([{ name: 'Patient', schema: UserSchema }]),
    

    ConfigModule.forRoot({
        envFilePath:'.env',
        isGlobal:true,
      }),
    JwtModule.register({
      secret:process.env.JWT_SECRET,
      signOptions: { expiresIn: '2d' }, 
    }),
  ],
  controllers: [UserController], // Register the controller
  providers: [UserService,MailService], // Register the service
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: 'users/my-appointments', method: RequestMethod.ALL }); 
  }
}
