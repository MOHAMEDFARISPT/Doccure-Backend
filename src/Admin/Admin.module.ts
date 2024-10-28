/* eslint-disable prettier/prettier */

import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminController } from "./Controllers/admin/admin.controller";
import { AdminService } from "./Services/admin/admin.service";
import { MailService } from "src/mail/mail.service";
import { UserSchema } from "src/Users/Schema/user.Schema";
import { DoctorSchema } from "src/Doctors/schema/doctor.schema";
import { AdminSchema } from "./Schema/admin.schema";
import { specialityScheama } from "./Schema/speciality.schema";
import { JwtMiddleware } from "src/middlewares/auth.middlware";
import { UserModule } from "src/Users/user.Module";
import { ContactFormSchema } from "src/Users/Schema/contactUs.schema";
import { AppointmentSchema } from "src/Users/Schema/Appointment.Schema";





@Module({
    imports: [
      MongooseModule.forFeature([
        { name: 'User', schema: UserSchema },
        { name: 'Doctor', schema: DoctorSchema },
        { name: 'Admin', schema: AdminSchema },
        {name:'speciality',schema:specialityScheama},
      { name: 'contactForm', schema: ContactFormSchema },
      { name: 'Appointment', schema: AppointmentSchema },
      ]),
      UserModule,
      ConfigModule.forRoot({
          envFilePath:'.env',
          isGlobal:true,
        }),
      JwtModule.register({
        secret:process.env.JWT_SECRET,
        signOptions: { expiresIn: '2d' }, 
      }),
    ],
    controllers: [AdminController],
    providers: [AdminService,MailService], 
  })


export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    
      consumer
      .apply(JwtMiddleware)
      .exclude({path:'Admin/Admin-login',method:RequestMethod.POST})
      .forRoutes(AdminController)

    }
}