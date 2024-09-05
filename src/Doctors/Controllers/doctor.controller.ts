/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { DoctorService } from '../services/doctor.service';
import { AvailableTime, combinedInterface, doctorLogin, doctorrequestsResponseDto } from '../interfaces/DoctorInterface';


@Controller('doctors')
export class DoctorController {


    constructor(private DoctorService:DoctorService){}

    @Post('Doctor-Register')
    async CreateDoctor(@Body() registerDoctorDto:combinedInterface):Promise<doctorrequestsResponseDto>{
       const response=await this.DoctorService.CreateDoctor(registerDoctorDto)
       return response
        
    }



    @Post('Doctor-login')
    async loginDoctor(@Body() loginDatas:doctorLogin):Promise<doctorrequestsResponseDto>{
      return await this.DoctorService.loginDoctor(loginDatas)
 
    }


    @Get('loadDoctorDatas')
    async loadDoctorDatas() {
      return await this.DoctorService.loadDoctorDatas();
     
    }


  @Post()
  async createAvailableTime(@Body() availableTimeData: AvailableTime) {
   const result= this.DoctorService.createAvailableTime(availableTimeData);
   console.log(result)
  }










    
}
