/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller,Post } from '@nestjs/common';
import { UserService } from '../Services/user.service';
import { CreateUserDto, createUserResponseDto, LoginDto, LoginResponseDto } from '../DTO/user.dto';
import { ResponseDto } from 'src/Doctors/Dto/createDoctor';



@Controller('users')
export class UserController {
    constructor(private readonly userServices:UserService){}

@Post('googlelogin')
async Googlelogin(@Body() user){
  return await this.userServices.GoogleAuthentication(user)
   
}









    @Post('register')
    async create(@Body() createUserDto: CreateUserDto):Promise<ResponseDto>{
      try {
        console.log("controller//",createUserDto)
        const response = await this.userServices.createUser(createUserDto);
        return response
      } catch (error) {
        console.error('Error during registration:', error); // Logging error for debugging
        return {
          success: false,
          message: 'Something went wrong. Please try again later.'
        };
      }
    }



    @Post('verify-Otp')
    async verifyOtp(@Body() body: { otp: string, email: string }):Promise<ResponseDto>{
      const { otp, email } = body;
      console.log(otp,email)
      try {
        const response=await this.userServices.verifyUser(otp,email)
        return response
      } catch (error) {
        
      }
      
    }


    @Post('login')
    async login(@Body() loginDto:LoginDto):Promise<LoginResponseDto> {
        return this.userServices.login(loginDto);
        
    }
    
    


}

