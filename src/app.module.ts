/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './Users/user.Module';
import { DoctorModule } from './Doctors/doctor.module';
import { MailService } from './mail/mail.service';
import { AdminModule } from './Admin/Admin.module';





@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION_STRING, {
      serverSelectionTimeoutMS: 5000,
    }),
    UserModule,
    DoctorModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}