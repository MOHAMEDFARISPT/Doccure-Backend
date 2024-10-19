/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post } from '@nestjs/common';
import { Category, loadAllcategories } from 'src/Admin/interfaces/interface';
import { AdminService } from 'src/Admin/Services/admin/admin.service';
import { commonResponse } from 'src/Users/Interfaces/UserInterface';

@Controller('Admin')
export class AdminController {
  constructor(private adminservice: AdminService) {}


  @Post('ContactUsForm')
  async ContactUsForm(@Body() value:{email:string,phone:string,name:string,message:string}){
    return this.adminservice.ContactUsForm(value)
  }
  @Post('Admin-login')
  async login(@Body() value: { email: string; password: string }) {
    return this.adminservice.loginAdmin(value);
  }


  @Get('loadUserDatas')
  getPatients() {
    return this.adminservice.fetchPatients();
  }

  @Get('Doctor-Requests')
  getDoctorRequests() {
    return this.adminservice.getDoctorRequests();
  }

  @Post('accept-request')
  acceptRequest(@Body() acceptRequestDto: string) {
    return this.adminservice.acceptRequest(acceptRequestDto);
  }

  @Post('blockDoctor')
  blockDoctor(@Body()  body: { doctorId: string }) {
  const {doctorId}=body
    return this.adminservice.blockUser(doctorId);
  }
  @Post('cancelRegistration')
  cancelRegistration(@Body() payload:{reason:string,DoctorId:string}){
    return this.adminservice.cancelRegistration(payload)
  }

  @Post('blockPatient')
  blockPatient(@Body() body:{patientId:string}){
    const {patientId}=body
    return this.adminservice.blockPatient(patientId)
  }

  @Post('AddSpeciality')
  addSpeciality(@Body() payloads:{specialityname:string,specialityDescription:string}){
    const {specialityname,specialityDescription}=payloads
    return this.adminservice.addSpeciality(specialityname,specialityDescription)
  }
  @Get('Specialisations')
  Specialities():Promise<loadAllcategories>{
    return this.adminservice.Specialities()
   
  }

  @Delete('specialities/:id')
  async deleteSpecialisation(@Param('id') DepartmentId: string): Promise<commonResponse> {
       return this.adminservice.deleteSpecialisation(DepartmentId); 
  }

  @Patch('specialities/:id')
  async changeDepartmentStatus(
    @Param('id') departmentId: string
  ): Promise<commonResponse> {
    console.log('Department ID:', departmentId); 
    return this.adminservice.changeDepartmentStatus(departmentId);
  }
}
