/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller,Get,Param,Post, Query } from '@nestjs/common';
import { UserService } from '../Services/user.service';
import { commonResponse, createUserResponse, User, userlogin } from '../Interfaces/UserInterface';
import { AvailableTimeResponse } from 'src/Doctors/interfaces/DoctorInterface';




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
        const result=await  this.userServices.login(loginDto)
        console.log(result)
        return result


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



  // Assuming your service has a method that finds by doctorId and selectedDay
  return await this.userServices.findAvailableSlots(doctorId, selectedDay);
 
}


    
    


}

