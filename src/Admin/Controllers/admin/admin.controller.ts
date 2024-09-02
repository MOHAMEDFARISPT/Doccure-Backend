/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AdminService } from 'src/Admin/Services/admin/admin.service';

@Controller('Admin')
export class AdminController {
    constructor(private adminservice:AdminService){}

    @Get('getPatients')
    getPatients():any{
        console.log("/////////")
        return this.adminservice.fetchPatients();
    }
    
    @Get('Doctor-Requests')
    getDoctorRequests(){
        return this.adminservice.getDoctorrequests();
    }


    @Post('accept-request')
     acceptRequest(@Body() acceptRequestDto:any){
        return this.adminservice.acceptRequest(acceptRequestDto)

     }

    
    
    






}
