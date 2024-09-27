/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Post, Query,  } from '@nestjs/common';
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

    @Get('loadDoctor')
    async loadDoctor(@Query('DoctorId') DoctorId: string) {
      return await this.DoctorService.loadDoctorData(DoctorId);
    }
    


  @Post('available-slots')
  async createAvailableTime(@Body() availableTimeData: AvailableTimeInterface) {
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
   async deleteAllSlots(@Body() body:{day:string,doctorid:string}) {
    const {day,doctorid}=body
    return this.DoctorService.deleteAllSlots(day, doctorid);
  }

  @Post('changepassword')
  async changePassword(
    @Body() body: { oldPassword: string, newPassword: string, confirmPassword: string, doctorId: string }
  ) {
    const { oldPassword, newPassword, confirmPassword, doctorId } = body;
    return this.DoctorService.changePassword(body)
  
  
  
  
  
  }
  

  @Post('profileUpload')
  async uploadProfile(@Body() body: { secure_url: string; doctorId: string }) {
    const {secure_url,doctorId}=body
   return this.DoctorService.uploadProfile(secure_url,doctorId)
  }

  @Get('Appointments')
  async Appointments(@Query('DoctorId') DoctorId:string){
    return this.DoctorService.getAppointments(DoctorId)
  }


  @Get('loadAppointments')
  async loadAppointments(){
    return this.DoctorService.loadAppointments()
  }

 

  






  }
















    

