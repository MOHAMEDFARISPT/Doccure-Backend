/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller,Post } from '@nestjs/common';
import { UserService } from '../Services/user.service';
import { commonResponse, createUserResponse, User, userlogin } from '../Interfaces/UserInterface';




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
    console.error('Error during OTP verification:', error); // Logging error for debugging
    return {
      success: false,
      message: 'OTP verification failed. Please try again later.',
    };
  }
}


    @Post('login')
    async login(@Body() loginDto:userlogin):Promise<createUserResponse> {
    return await  this.userServices.login(loginDto)


    }

@Post('googlelogin')
async Googlelogin(@Body() user){
  return await this.userServices.GoogleAuthentication(user)


   
}

    
    


}

