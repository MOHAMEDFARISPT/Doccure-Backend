/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AdminService } from 'src/Admin/Services/admin/admin.service';

@Controller('Admin')
export class AdminController {
    constructor(private adminservice:AdminService){}

    @Get('loadUserDatas')
    getPatients(){
       
        return this.adminservice.fetchPatients();
    }
    
    @Get('Doctor-Requests')
    getDoctorRequests(){
        return this.adminservice.getDoctorRequests();
    }


    @Post('accept-request')
     acceptRequest(@Body() acceptRequestDto:string){
        return this.adminservice.acceptRequest(acceptRequestDto)

     }

    
    
    






}
