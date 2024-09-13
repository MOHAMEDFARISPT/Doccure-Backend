/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Post,  } from '@nestjs/common';
import { DoctorService } from '../services/doctor.service';
import { AvailableTimeInterface, AvailableTimeResponse, combinedInterface, doctorLogin, doctorrequestsResponseDto } from '../interfaces/DoctorInterface';
import { get } from 'http';


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


  @Post('available-slots')
  async createAvailableTime(@Body() availableTimeData: AvailableTimeInterface) {
    console.log("availableTimeData///",availableTimeData)
     return await this.DoctorService.createAvailableTime(availableTimeData);

  }

  @Post('getSlots')
  async loadSlots(@Body() body:{ day: string; doctorId: string } ):Promise<AvailableTimeResponse>{
      const {day,doctorId}=body
   return await this.DoctorService.getSlots(day,doctorId)

  }



  @Post('deleteSlot')
  async deleteSlot(@Body() body:{day:string;doctorId:string,Slotid:string}):Promise<AvailableTimeResponse>{
    const {day,doctorId,Slotid}=body
    return await this.DoctorService.deleteSlot(day,doctorId,Slotid)
  }







  @Post('deleteAllslots')
   async deleteAllSlots(@Body() body:{day:string,doctorId:string}) {
    const {day,doctorId}=body
    return this.DoctorService.deleteAllSlots(day, doctorId);
  }
















    
}
