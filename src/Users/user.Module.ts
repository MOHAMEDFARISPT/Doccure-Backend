/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { User, UserSchema } from './Schema/user.Schema';
import { UserController } from './controllers/user.controller';
import { UserService } from './Services/user.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule.forRoot({
        envFilePath:'.env',
        isGlobal:true,
      }),
    JwtModule.register({
      secret:process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' }, 
    }),
  ],
  controllers: [UserController], // Register the controller
  providers: [UserService], // Register the service
})
export class UserModule {}
