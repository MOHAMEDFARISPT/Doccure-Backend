/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller,Get,Param,Post, Query } from '@nestjs/common';
import { UserService } from '../Services/user.service';
import { Appointmentcreation, commonResponse, createUserResponse, IWallet, User, userlogin } from '../Interfaces/UserInterface';
import { AvailableTimeResponse } from 'src/Doctors/interfaces/DoctorInterface';
import { Console } from 'console';
import { Observable } from 'rxjs';




@Controller('users')
export class UserController {
    constructor(private readonly userServices:UserService){}









    @Post('register')
  async create(@Body() createUserDto: User): Promise<commonResponse> {
    return await this.userServices.createUser(createUserDto);
  }



    @Post('verify-Otp')
  async verifyOtp(@Body() body: { otp: string, email: string }): Promise<createUserResponse> {
  const { otp, email } = body;
  console.log(otp, email);
  try {
    const response = await this.userServices.verifyUser(otp, email);
    return response;
  } catch (error) {
    
    return {
      success: false,
      message: 'OTP verification failed. Please try again later.',
    };
  }
}


    @Post('login')
    async login(@Body() loginDto:userlogin):Promise<createUserResponse> {
        return  await  this.userServices.login(loginDto)

      


    }

@Post('googlelogin')
async Googlelogin(@Body() user){
  return await this.userServices.GoogleAuthentication(user)


   
}

@Get('available-times')
async getAvailableTimes(

  @Query('drid') doctorId: string,
  @Query('selectedDay') selectedDay: string,
): Promise<AvailableTimeResponse> {
  return await this.userServices.findAvailableSlots(doctorId, selectedDay);
 
}


@Get('loaduserData')
async loadUserData(@Query('userId') userId:string) {
return this.userServices.loaduserData(userId)

}



@Post('createOrder')
createOrder(@Body() createOrderDto: { amount: number; currency: string }) {
  return this.userServices.createOrder(createOrderDto.amount, createOrderDto.currency);
}

@Post('verifypayment')
verifyPayment(@Body() verifyPaymentDto: any) {

  
  return this.userServices.verifyPayment(verifyPaymentDto);
}

@Post('createAppointment')
createAppointment(@Body() appointmentData:Appointmentcreation):Promise<commonResponse>{
 return this.userServices.createAppointment(appointmentData)

}

@Get('getWallet/:userId') 

getWallet(@Param('userId') userId: string){
  return this.userServices.getWallet(userId)

}

@Get('getAppointments')
getAppointments(@Query('patientId') patientId:string){
  return this.userServices.getAppointments(patientId)
}

@Get('getappointment')
getAppointment( @Query('apmntId') apmntId: string, @Query('userId') userId: string,){
return this.userServices.getappointment(apmntId,userId)
}



@Post('cancellAppointment')
async cancellAppointment(@Body() payload:{appointmentId:string,userId:string,reason:string}){
 const {appointmentId,userId,reason}=payload

 return this.userServices.cancellAppointment(appointmentId,userId,reason)

}

}









    
    




