/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../Services/user.service';
import {
  Appointmentcreation,
  changepassword,
  commonResponse,
  createUserResponse,
  IWallet,
  User,
  userlogin,
  userProfileDetailes,
} from '../Interfaces/UserInterface';

import { AvailableTimeResponse } from 'src/Doctors/interfaces/DoctorInterface';
import { Console } from 'console';
import { Observable } from 'rxjs';
import { loadAllcategories } from 'src/Admin/interfaces/interface';
import { DoctorModel } from 'src/Doctors/schema/doctor.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userServices: UserService) {}

  @Post('register')
  async create(@Body() createUserDto: User): Promise<commonResponse> {
    return await this.userServices.createUser(createUserDto);
  }

  @Post('verify-Otp')
  async verifyOtp(
    @Body() body: { otp: string; email: string },
  ): Promise<createUserResponse> {
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

  @Post('resendOtp')
  async resendOtp(@Body() payload: { useremail: string }) {
    const { useremail } = payload;
    return await this.userServices.resendOtp(useremail);
  }

  @Post('login')
  async login(@Body() loginDto: userlogin): Promise<createUserResponse> {
    console.log('in controller');
    return await this.userServices.login(loginDto);
  }

  @Post('uploadProfileImage')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(@Req() req: Request,@UploadedFile() file:Express.Multer.File) {
     const userId=req.body.userId
   return  this.userServices.uploadProfileImage(file,userId)

  }
  @Post('refresh')
  async refreshAccessToken(@Body('refreshToken') refreshToken: string): Promise<{ accessToken: string }> {
    console.log("Helloooooooooo/////")
    return this.userServices.refreshAccessToken(refreshToken);
  }

  @Post('updateProfileDetailes')
  async updateProfileDetailes(@Body() body:{updateProfileDetailes:userProfileDetailes,userId:string}){
     const {updateProfileDetailes,userId}=body
    return this.userServices.updateProfileDetailes(updateProfileDetailes,userId)
  }

  @Post('googlelogin')
  async Googlelogin(@Body() user) {
    return await this.userServices.GoogleAuthentication(user);
  }

  @Post('getDoctors')
  async getDoctors(@Body() body: { genders: string[] }) {
    const { genders } = body;
    const doctors = await this.userServices.findDoctorsByGenders(genders);
    return doctors;
  }

  @Get('getAllDoctors')
  async getAllDoctors(@Query('page') currentPage:number,@Query('limit') limit:number) {
    return this.userServices.getAllDoctors(Number(currentPage),Number(limit));
  }
  @Get('filteronExperience')
  async getDoctorsByExperience(
    @Query('experience') selectedExperience: string,
  ): Promise<DoctorModel[]> {
    try {
      if (!selectedExperience) {
        throw new InternalServerErrorException('Experience range is required');
      }

      // Pass the selected experience to the service
      const filteredDoctors =
        await this.userServices.filteronExperience(selectedExperience);
      return filteredDoctors;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching doctors based on experience',
      );
    }
  }

  @Get('filteronDepartment')
  async getDoctorsByDepartment(
    @Query('department') selectedDepartment: string,
  ): Promise<DoctorModel[]> {
    try {
      if (!selectedDepartment) {
        throw new InternalServerErrorException('Experience range is required');
      }

      // Pass the selected experience to the service
      const filteredDoctors =
        await this.userServices.filteronDepartment(selectedDepartment);
      return filteredDoctors;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching doctors based on experience',
      );
    }
  }

  @Get('filteronSerch')
  async searchDoctors(
    @Query('search') searchTerm: string,
  ): Promise<DoctorModel[]> {
    return this.userServices.searchDoctors(searchTerm);
  }
  @Get('Specialisations')
  Specialities(): Promise<loadAllcategories> {
    return this.userServices.Specialities();
  }
  @Post('change-password')
  async changePassword(
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
      userId: string;
    },
  ): Promise<any> {
    const { currentPassword, newPassword, confirmPassword, userId } = body;

    return this.userServices.changePassword(
      userId,
      currentPassword,
      newPassword,
      confirmPassword,
    );
  }
  @Post('likeDoctor')
  async likeDoctor(@Body() body: { doctorId: string }) {
    const { doctorId } = body;
    console.log('doctorId?>>>>>><>.>>>>>', doctorId);
    return this.userServices.likeDoctor(doctorId);
    
   
  }

  @Get('available-times')
  async getAvailableTimes(
    @Query('drid') doctorId: string,
    @Query('selectedDay') selectedDay: string,
  ): Promise<AvailableTimeResponse | InternalServerErrorException> {
    return await this.userServices.findAvailableSlots(doctorId, selectedDay);
  }

  @Get('loaduserData')
  async loadUserData(@Query('userId') userId: string) {
    return this.userServices.loaduserData(userId);
  }

  @Get('fetchDoctor')
  async fetchDoctor(@Query('doctorId') doctorId:string){
    console.log(doctorId)
    const result=await this.userServices.fetchDoctor(doctorId)
    console.log('result///',result)
    return result
  }

  @Post('createOrder')
  async createOrder(@Body() createOrderDto: { amount: number; currency: string }) {
    const result=await this.userServices.createOrder(createOrderDto.amount,createOrderDto.currency,);
    return result
  }

  @Post('verifypayment')
  verifyPayment(@Body() verifyPaymentDto: any) {
    console.log("verifyPaymentDto",verifyPaymentDto)
    return this.userServices.verifyPayment(verifyPaymentDto);
  }

  @Post('createAppointment')
  createAppointment(
    @Body() appointmentData: Appointmentcreation,
  ): Promise<commonResponse> {
    return this.userServices.createAppointment(appointmentData);
  }

  @Get('getWallet/:userId')
  getWallet(@Query('page') currentPage:number,@Query('limit') limit:number, @Param('userId') userId: string) {
    return this.userServices.getWallet(userId,currentPage,Number(limit));
  }

  @Get('getAppointments')
  getAppointments(@Query('patientId') patientId: string,@Query('page') currentPage: number,@Query('limit') limit: number,@Query('selectedStatus') selectedStatus: string) {
    return this.userServices.getAppointments(patientId,currentPage,limit,selectedStatus);
  }
  selectedStatus

  @Get('getappointment')
  getAppointment(
    @Query('apmntId') apmntId: string,
    @Query('userId') userId: string,
  ) {
    return this.userServices.getappointment(apmntId, userId);
  }

  @Post('cancellAppointment')
  async cancellAppointment(
    @Body() payload: { appointmentId: string; userId: string; reason: string },
  ) {
    const { appointmentId, userId, reason } = payload;

    return this.userServices.cancelAppointment(appointmentId, userId, reason);
  }
}
