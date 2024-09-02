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

@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([{ name: 'Doctor', schema: DoctorSchema }]),
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
