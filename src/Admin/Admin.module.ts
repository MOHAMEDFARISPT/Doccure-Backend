/* eslint-disable prettier/prettier */

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminController } from "./Controllers/admin/admin.controller";
import { AdminService } from "./Services/admin/admin.service";
import { MailService } from "src/mail/mail.service";
import { UserSchema } from "src/Users/Schema/user.Schema";
import { DoctorSchema } from "src/Doctors/schema/doctor.schema";





@Module({
    imports: [
      MongooseModule.forFeature([
        { name: 'User', schema: UserSchema },
        { name: 'Doctor', schema: DoctorSchema },
      ]),
      ConfigModule.forRoot({
          envFilePath:'.env',
          isGlobal:true,
        }),
      JwtModule.register({
        secret:process.env.JWT_SECRET,
        signOptions: { expiresIn: '60m' }, 
      }),
    ],
    controllers: [AdminController], // Register the controller
    providers: [AdminService,MailService], // Register the service
  })


export class AdminModule {}