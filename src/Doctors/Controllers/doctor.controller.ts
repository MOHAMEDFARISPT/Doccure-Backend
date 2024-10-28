/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Query, Req, UploadedFile, UseInterceptors,  } from '@nestjs/common';
import { DoctorService } from '../services/doctor.service';
import { AvailableTimeInterface, AvailableTimeResponse, combinedInterface, doctorLogin, doctorrequestsResponseDto, DoctorStatistics, generalDetails, personalDetails, professionalDetails, UpcomingAppointmentOverView } from '../interfaces/DoctorInterface';
import { get } from 'http';
import { commonResponse } from 'src/Users/Interfaces/UserInterface';
import { ObjectId } from 'mongoose';
import { query } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('Doctors')
export class DoctorController {



    constructor(private DoctorService:DoctorService){}

    @Post('Doctor-Register')
    @UseInterceptors(FileInterceptor('MedicalDocument'))
    async CreateDoctor(
      @UploadedFile() file: Express.Multer.File,
      @Body() registerDoctorDto: any // Temporarily using `any` type to handle parsing
    ): Promise<doctorrequestsResponseDto> {
      try {
        // Parse each field in registerDoctorDto
        const parsedRegisterDoctorDto = {
          personalDetails: JSON.parse(registerDoctorDto.personalDetails),
          generalDetails: JSON.parse(registerDoctorDto.generalDetails),
          professionalDetails: JSON.parse(registerDoctorDto.professionalDetails),
        };
    
        console.log('Parsed registerDoctorDto:', parsedRegisterDoctorDto);
    
        // Pass parsed data to the service
        const response = await this.DoctorService.CreateDoctor(parsedRegisterDoctorDto, file);
        return response;
      } catch (error) {
        console.error('Error parsing registerDoctorDto:', error);
        throw new InternalServerErrorException('Error parsing registration data');
      }
    }
    
    @Get('fetchDepartments')
    async fetchDepartments():Promise<string[]>{
      return this.DoctorService.fetchDepartments()
    }

    @Get('fetchTransactions/:doctorId')
    async fetchTransactions(@Param('doctorId') doctorId:string,@Query('page') currentPage: number,@Query('limit') limit: number){
      console.log("Helloooooo//cd,m clkdmel")
      return this.DoctorService.fetchTransactions(doctorId,Number(currentPage),Number(limit))
    }

    @Get('fetchSearchResults/:doctorId')
    async fetchSearchResults(@Param('doctorId',) doctorId:string,@Query('searchTerm') searchTerm:string,@Query('page') currentPage: number,@Query('limit') limit: number){
      return this.DoctorService.fetchSearchResults(searchTerm,doctorId,Number(currentPage),Number(limit))
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
    @Get('filterAppointment/:doctorId')
  async getAppointments(
    @Query('status') status: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('doctorId') doctorId: string
    
  ) {
    console.log('doctorId in controller',doctorId)
    return  this.DoctorService.getAppointmentsByDoctorAndStatus(doctorId, status,Number(page),Number(limit));
  }

  @Get('fetchMypatients/:doctorId')
  async fetchMypatients(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('doctorId') doctorId: string
  ){
    return this.DoctorService.fetchMypatients(doctorId,Number(page),Number(limit))
  }
    
    @Get(':doctorId/statistics')
    async getDoctorStatistics(@Param('doctorId') doctorId: string) {
      return this.DoctorService.getDoctorStatistics(doctorId);
    }

    @Get('fetchUpcomingAppointmentOverview/:doctorId')
    async fetchUpcomingAppointmentOverview(@Param('doctorId') doctorId:string){
      return this.DoctorService.getfetchUpcomingAppointmentOverview(doctorId)
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


  @Post('editPersonalDetailes')
  async editPersonalDetailes(@Body() body: { payload: { editedpersonalDetailes: personalDetails, DoctorId: string } }){
   
    const {editedpersonalDetailes,DoctorId}=body.payload
return this.DoctorService.updatepersonalDetailes(editedpersonalDetailes,DoctorId)
  }

  @Post('editedgeneralDetailes')
  async editedgeneralDetailes(@Body() body:{payload:{editedgeneralDetailes:generalDetails,DoctorId:string}}){
    const {editedgeneralDetailes,DoctorId}=body.payload
    return this.DoctorService.updategeneralDetailes(editedgeneralDetailes,DoctorId)
  }
  @Post('editedProfessionalDetails')
  async editedProfessionalDetails(@Body() body:{payload:{editedProfessionalDetails:professionalDetails,DoctorId:string}}){
    const {editedProfessionalDetails,DoctorId}=body.payload
    return this.DoctorService.updateProfessionalDetails(editedProfessionalDetails,DoctorId)
 
  }
 
  

  @Post('uploadProfileImage')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(@Req() req: Request,@UploadedFile() file:Express.Multer.File) {
     const DoctorId=req.body.DoctorId
   return  this.DoctorService.uploadProfileImage(file,DoctorId)

  }
  

  @Get('Appointments')
async Appointments(@Query('DoctorId') DoctorId: string,@Query('page') currentPage: number,@Query('limit') limit: number) {
  
  return this.DoctorService.getAppointments(DoctorId,currentPage,limit);
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
















    

