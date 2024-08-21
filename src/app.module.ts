/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './Users/user.Module';





@Module({
  imports:[
    ConfigModule.forRoot({
      envFilePath:'.env',
      isGlobal:true,
    }),
    
    MongooseModule.forRoot(process.env.MONGO_CONNECTION_STRING),
    UserModule
    


  ],
  controllers:[AppController,],
  providers:[AppService]


  
})
export class AppModule {}
