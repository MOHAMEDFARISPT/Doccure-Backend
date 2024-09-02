/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule} from '@nestjs/jwt';

import {TemporaryUser, UserSchema } from './Schema/user.Schema';
import { UserController } from './controllers/user.controller';
import { UserService } from './Services/user.service';
import { ConfigModule } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name:'User', schema: UserSchema }]),
    MongooseModule.forFeature([{name:'Tempuser',schema:TemporaryUser}]),
    ConfigModule.forRoot({
        envFilePath:'.env',
        isGlobal:true,
      }),
    JwtModule.register({
      secret:process.env.JWT_SECRET,
      signOptions: { expiresIn: '1m' }, 
    }),
  ],
  controllers: [UserController], // Register the controller
  providers: [UserService,MailService], // Register the service
})
export class UserModule {}
