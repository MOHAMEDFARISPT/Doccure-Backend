/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Query, Req,  } from '@nestjs/common';
import { DoctorService } from '../services/doctor.service';
import { AvailableTimeInterface, AvailableTimeResponse, combinedInterface, doctorLogin, doctorrequestsResponseDto, DoctorStatistics } from '../interfaces/DoctorInterface';
import { get } from 'http';
import { commonResponse } from 'src/Users/Interfaces/UserInterface';
import { ObjectId } from 'mongoose';


@Controller('Doctors')
export class DoctorController {



    constructor(private DoctorService:DoctorService){}

    @Post('Doctor-Register')
    async CreateDoctor(@Body() registerDoctorDto:combinedInterface):Promise<doctorrequestsResponseDto>{
       const response=await this.DoctorService.CreateDoctor(registerDoctorDto)
       return response
        
    }



    @Post('Doctor-login')
    async loginDoctor(@Body() loginDatas:doctorLogin):Promise<doctorrequestsResponseDto>{
      console.log("Hello no errorrrhuhu")
      return await this.DoctorService.loginDoctor(loginDatas)
   
 
    }
  
    @Get('loadDoctorDatas')
    async loadDoctorDatas() {
      console.log("Helloooo")
      return await this.DoctorService.loadDoctorDatas();
     
    }
    @Get('loadDoctor')
    async loadDoctor(@Query('DoctorId') DoctorId: string) {
      console.log("hERE AAN")
      return await this.DoctorService.loadDoctorData(DoctorId);
    }
    @Get('filterAppointment')
  async getAppointments(
    @Query('status') status: string, 
    @Query('doctorId') doctorId: string
  ) {
    console.log('QueryTesting////',status)
    console.log('QueryTesting',doctorId)
    return await this.DoctorService.getAppointmentsByDoctorAndStatus(doctorId, status);
  }
    
    @Get(':doctorId/statistics')
    async getDoctorStatistics(@Param('doctorId') doctorId: string) {
      console.log('doctorId//////////\\\\\\\\\\', doctorId);
      return this.DoctorService.getDoctorStatistics(doctorId);
    }
    
    


  @Post('available-slots')
  async createAvailableTime(@Body() availableTimeData: AvailableTimeInterface) {
     return await this.DoctorService.createAvailableTime(availableTimeData);
   

  }
 

  @Post('getSlots')
  async loadSlots(@Body() body:{ day: string; doctorId: string } ):Promise<AvailableTimeResponse|InternalServerErrorException>{
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
    return this.DoctorService.changePassword(body,)
  }
  

  @Post('profileUpload')
  async uploadProfile(@Body() body: { secure_url: string; doctorId: string }) {
    const {secure_url,doctorId}=body
   return this.DoctorService.uploadProfile(secure_url,doctorId)
  }

  @Get('Appointments')
async Appointments(@Query('DoctorId') DoctorId: string) {
  
  console.log("Doctor ID received:/// ", DoctorId);
  return this.DoctorService.getAppointments(DoctorId);
}


  @Get('loadAppointments')
  async loadAppointments(){
    console.log("Helloooo")
    return this.DoctorService.loadAppointments()
  }

  @Post('cancelAppointment')
  async cancellAppointment(@Body() payload:{appointmentId:string,reason:string,doctorId:string,patientId:string}){
  return this.DoctorService.cancelAppointment(payload)

  }

  @Post('blockUser')
  async blockUser(@Body() payload:{patientId:string}):Promise<commonResponse>{
    console.log('patientId///////////',payload.patientId)
    const {patientId}=payload
    return this.DoctorService.blockUser(patientId)
  }

 

  






  }
















    

