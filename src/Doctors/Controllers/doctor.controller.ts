/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { DoctorService } from '../services/doctor.service';
import { DoctorRegistrationDto, ResponseDto, loginDoctorDto } from '../Dto/createDoctor';

@Controller('doctors')
export class DoctorController {


    constructor(private DoctorService:DoctorService){}

    @Post('Doctor-Register')
    async CreateDoctor(@Body() registerDoctorDto:DoctorRegistrationDto):Promise<ResponseDto>{
       const response=await this.DoctorService.CreateDoctor(registerDoctorDto)
       return response
        
    }



    @Post('Doctor-login')
    async loginDoctor(@Body() loginDatas:loginDoctorDto):Promise<ResponseDto>{
      const  response= await this.DoctorService.loginDoctor(loginDatas)
      return response
    }


    @Get('loadDoctorDatas')
    async loadDoctorDatas() {
      console.log("get it in controllers////")
      return await this.DoctorService.loadDoctorDatas();
     
    }










    
}
