/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResponseDto } from 'src/Doctors/Dto/createDoctor';
import { DoctorModel } from 'src/Doctors/schema/doctor.schema';
import { User } from 'src/Users/Interfaces/UserInterface';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel('User') private userModel: Model<User>,
        @InjectModel('Doctor') private DoctorModel:Model<DoctorModel>,
        private mailService:MailService
    ){}
   async fetchPatients(): Promise<any> {
        const result= await this.userModel.find()
        return result
    }

    async getDoctorrequests(): Promise<any> {
        try {
        
          const doctorRequests = await this.DoctorModel.find({ 'personalDetails.isApproved': false }).exec();
          if (doctorRequests && doctorRequests.length > 0) {
            const responseData = doctorRequests.map(doctor => ({
              _id: doctor._id.toString(),
              personalDetails: {
                firstname: doctor.personalDetails.firstname,
                lastname: doctor.personalDetails.lastname,
                email: doctor.personalDetails.email,
                gender: doctor.personalDetails.gender,
                contactNumber: doctor.personalDetails.contactNumber,
                dateOfBirth: doctor.personalDetails.dateOfBirth,
                password: doctor.personalDetails.password,
                profileImage: doctor.personalDetails.profileImage,
                isApproved: doctor.personalDetails.isApproved,
                isBlocked: doctor.personalDetails.isBlocked,
                role: doctor.personalDetails.role,
              },
              generalDetails: {
                city: doctor.generalDetails.city,
                state: doctor.generalDetails.state,
                country: doctor.generalDetails.country,
                zipcode: doctor.generalDetails.zipcode,
                adharNumber: doctor.generalDetails.adharNumber,
              },
              professionalDetails: {
                medicalLicenceNumber: doctor.professionalDetails.medicalLicenceNumber,
                specialisedDepartment: doctor.professionalDetails.specialisedDepartment,
                totalExperience: doctor.professionalDetails.totalExperience,
                patientsPerDay: doctor.professionalDetails.patientsPerDay,
                consultationFee: doctor.professionalDetails.consultationFee,
              },
            }));
      
            
            return {
                responseData, 
            } 
            
          } else {
            
            return {
              success: true,
              message: 'No doctor requests found',
              data: [],
            };
          }
        } catch (error) {
         
          console.error('Error fetching doctor requests:', error);
      
          return {
            success: false,
            message: 'Failed to retrieve doctor requests',
            data: [], 
          };
        }
      }



      async acceptRequest(acceptRequestDto): Promise<ResponseDto> {
        const { id } = acceptRequestDto; 
    
       
        const doctor = await this.DoctorModel.findById(id).exec();
        
        if (doctor) {
         
          doctor.personalDetails.isApproved = true;
          await doctor.save(); 
    
         
          console.log("Saved successfully");
    
        
          const content = "Congratulations! Your request to Doccure Care Service is approved. You can now log in and start consultation.";
          console.log("doctor.personalDetails.email",doctor.personalDetails.email)
          console.log("doctor.personalDetails.lastname",doctor.personalDetails.lastname)
          await this.mailService.sendWelcomeEmail(doctor.personalDetails.email, doctor.personalDetails.lastname, content);
    
      
          return {
            success: true,
            message: "Request accepted successfully",
          };
        } else {
          
          return {
            success: false,
            message: "Doctor not found in the database",
          };
        }
      }

    }


    
       
      
        
     
      
      

