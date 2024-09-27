/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DoctorModel } from '../schema/doctor.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { ObjectId } from 'mongodb';

import {  AvailableTimeInterface, AvailableTimeResponse, combinedInterface, doctorLogin, doctorrequestsResponseDto, Slot } from '../interfaces/DoctorInterface';
import { types } from 'util';
import { promises } from 'dns';
import { Appointment, commonResponse } from 'src/Users/Interfaces/UserInterface';


export class DoctorService {
    constructor(
        @InjectModel('Doctor') private readonly doctorModel: Model<DoctorModel>,
        @InjectModel('availableTimes') private readonly AvailableTimeModel:Model<AvailableTimeInterface>,
        @InjectModel('Appointment') private readonly appointmentModel: Model<Appointment>,
        private readonly _jwtService: JwtService,
        private  readonly mailservice:MailService

      
      ) {}


      async loadDoctorDatas(): Promise<void> {
        // Fetch all doctors from the database
        const doctors = await this.doctorModel.find().exec();


    
        // Map the fetched doctors to the DoctorRegistrationDto
        const doctorData: any = doctors.map(doctor => ({
          _id: doctor._id.toString(),
          personalDetails: {
            firstName: doctor.personalDetails.firstName,
            lastName: doctor.personalDetails.lastName,
            email: doctor.personalDetails.email,
            gender: doctor.personalDetails.gender,
            contactNumber: doctor.personalDetails.contactNumber,
            dateofBirth: doctor.personalDetails.dateofBirth,
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
            bio: doctor.professionalDetails.bio,
            totalExperience: doctor.professionalDetails.totalExperience,
            patientsPerDay: doctor.professionalDetails.patientsPerDay,
            consultationFee: doctor.professionalDetails.consultationFee,
          },
        }));
    
        // Return the response DTO
        return doctorData
        
      }


   async loadDoctorData(doctorId:string):Promise<doctorrequestsResponseDto>{
    
    const parsedDoctorId = new ObjectId(doctorId);
   
 
const Doctor=await this.doctorModel.findOne({_id:parsedDoctorId}).exec()
return {
  success: true,
   message: "Doctor registered successfully",
   data:{
    _id:Doctor._id.toString(),
    personalDetails:{
      firstName:Doctor.personalDetails.firstName,
      lastName:Doctor.personalDetails.lastName,
      email:Doctor.personalDetails.email,
      gender:Doctor.personalDetails.gender,
      contactNumber:Doctor.personalDetails.contactNumber,
      dateofBirth:Doctor.personalDetails.dateofBirth,
      profileImage:Doctor.personalDetails.profileImage

    },
    generalDetails:{
      city:Doctor.generalDetails.city,
      state:Doctor.generalDetails.state,
      country:Doctor.generalDetails.country,
      zipcode:Doctor.generalDetails.zipcode,
      adharNumber:Doctor.generalDetails.adharNumber

    },
   professionalDetails:{
    medicalLicenceNumber:Doctor.professionalDetails.medicalLicenceNumber,
    specialisedDepartment:Doctor.professionalDetails.specialisedDepartment,
    bio:Doctor.professionalDetails.bio,
    totalExperience:Doctor.professionalDetails.totalExperience,
    patientsPerDay:Doctor.professionalDetails.patientsPerDay,
    consultationFee:Doctor.professionalDetails.consultationFee

   }
   }
}
   }

   async changePassword(body: { oldPassword: string, newPassword: string, confirmPassword: string, doctorId: string }):Promise<commonResponse>{

    const {oldPassword,newPassword,confirmPassword,doctorId}=body

 

      const ExistingUser=await this.doctorModel.findOne({_id:doctorId}).exec()


      const isPasswordValid = await bcrypt.compare(oldPassword, ExistingUser.personalDetails.password);

      if (!isPasswordValid) {
        return {
          success:false,
          message:'Old password is incorrect please check'
        }
      }
    
      // Check if newPassword and confirmPassword match
      if (newPassword !== confirmPassword) {
        return {
          success:false,
          message:'newPassword and confirmPassword are not match'
        }
       
      }

       
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  ExistingUser.personalDetails.password = hashedNewPassword;
  await ExistingUser.save();
  return {
    success: true,
    message: 'Password changed successfully',
  };

   }



    async CreateDoctor(registerDoctorDto: combinedInterface): Promise<doctorrequestsResponseDto> {
        const { email, password, ...otherPersonalDetails } = registerDoctorDto.personalDetails;
 
      
        const existingDoctor = await this.doctorModel.findOne({ 'personalDetails.email': email }).exec();
        
        if (!existingDoctor) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      
          const newDoctor = new this.doctorModel({
            personalDetails: {
              ...otherPersonalDetails,
              email: email,
              role:'Doctor',
              password: hashedPassword
            },
            generalDetails: registerDoctorDto.generalDetails,
            professionalDetails: registerDoctorDto.professionalDetails
          });
      
          await newDoctor.save();
 
         const  content="Wlcome to the Doccure Care Service you will get an E-mail After You verified "
          await this.mailservice.sendWelcomeEmail(email,otherPersonalDetails.lastName,content); 


          // Return response according to createDoctorDto
          return {
            success: true,
            message: "Doctor registered successfully",
            data:{
                _id:newDoctor._id.toString(),
                personalDetails:newDoctor.personalDetails,
                generalDetails:newDoctor.generalDetails,
                professionalDetails:newDoctor.professionalDetails

            }
          };
        } else {
          return {
            success: false,
            message: "Doctor already exists Please login",
            
          };
        }
      }

      async findByEmail(email: string): Promise<any | null> {
        return   await this.doctorModel.findOne({ 'personalDetails.email': email }).lean().exec();
   
      }


      async loginDoctor(loginDatas: doctorLogin): Promise<doctorrequestsResponseDto> {
        const { email, password } = loginDatas;
       
      
        const ExistingDoctor = await this.doctorModel.findOne({'personalDetails.email': email}).exec();
      
        if (ExistingDoctor) {
          const passwordMatch = await bcrypt.compare(password, ExistingDoctor.personalDetails.password);
      
          if (passwordMatch) {
            const payload = { userId: ExistingDoctor._id.toString(), email: ExistingDoctor.personalDetails.email,role:ExistingDoctor.personalDetails.role };
            const token = this._jwtService.sign(payload);

   
      
            const { lastName } = ExistingDoctor.personalDetails;
          
            return {
              success: true,
              message: lastName + ' Logged In Successfully',
              data: {
                _id: ExistingDoctor._id.toString(),
                personalDetails: ExistingDoctor.personalDetails,
                generalDetails: ExistingDoctor.generalDetails,
                professionalDetails: ExistingDoctor.professionalDetails
              },
              token: token
            };
          } else {
            return {
              success: false,
              message: 'Invalid credentials, please try again'
            };
          }
        } else {
          return {
            success: false,
            message: 'Doctor is not registered, please register'
          };
        }
      }




      async createAvailableTime(availableTimeData: AvailableTimeInterface):Promise<AvailableTimeResponse> {
        const { startTime, endTime, day, doctorId } = availableTimeData;
      
        try {
            // Find if any existing time slot overlaps with the new time range
            const existingTiming = await this.AvailableTimeModel.findOne({
                day,
                doctorId,
                $or: [
                    { startTime: { $lt: endTime, $gte: startTime } }, 
                    { endTime: { $gt: startTime, $lte: endTime } },  
                    { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
                ]
            }).exec();
      
            // If an overlapping time slot is found
            if (existingTiming) {
               
                return {
                    success: false,
                    message: 'A time slot already exists within the provided range for this day.'
                };
            }
      
            // If no overlap, proceed to create the time slot
            const availableTiming = new this.AvailableTimeModel({
                day,
                startTime,
                endTime, 
                doctorId,
            });
      
            await availableTiming.save();
            return {
                message: 'Slots created successfully',
                success: true
            };
      
        } catch (error) {
           
            throw new Error("Could not save available time");
        }
    }
    
      

   

async getSlots(day: string, doctorId: string): Promise<AvailableTimeResponse> {
  const parsedId=new ObjectId(doctorId)
  const result = await this.AvailableTimeModel.find({ day:day,doctorId: parsedId }).exec();
  
  const slots: Slot[] = result.map((slot) => ({
    _id: slot._id.toString(),  
    DoctorId:slot.doctorId,
    startTime: slot.startTime,
    isBooked:slot.isBooked,
    endTime: slot.endTime,
  }));


  return {
    slots,
    success: true,
    message: '',
  };
}


      async deleteAllSlots(day:string,doctorId:string):Promise<AvailableTimeResponse>{
      

        const parsedDoctorId=new ObjectId(doctorId)

  const result = await this.AvailableTimeModel.deleteMany({ day, doctorId: parsedDoctorId });

        if (!result) {
          return {
            success:false,
            message:'Delete Failed'
          }
          
        }else{
          return {
            success:true,
            message:'Delete Slots'
          }
        }

      }


      async deleteSlot(day: string, doctorId: string, Slotid: string): Promise<AvailableTimeResponse> {
        try {
          const objectIdSlot = new ObjectId(Slotid);
          const objectIdDoctor = new ObjectId(doctorId);
        
          const existing = await this.AvailableTimeModel.findOne({ _id: objectIdSlot });

          if (!existing) {
            return { success: false, message: "Slot not found" };
          }

      
          // Delete the slot
          await this.AvailableTimeModel.deleteOne({ _id: Slotid });
      
          return { success: true, message: "Slot deleted successfully" };
        } catch (error) {
          console.error("Error deleting slot:", error);
          return { success: false, message: "Failed to delete slot" }; 
        }
      }



      async uploadProfile(secure_url,doctorId){

        const ExistingDoctor=await this.doctorModel.findOne({_id:doctorId}).exec()

        if(ExistingDoctor){
          ExistingDoctor.personalDetails.profileImage=secure_url

        await  ExistingDoctor.save()
        }

      }



      async getAppointments(DoctorId:string):Promise<Appointment[]>{
        const parsedDoctorId=new ObjectId(DoctorId)
        
        const result=await this.appointmentModel.find({doctorId:parsedDoctorId})
        .populate('doctorId')
        .populate('patientId')
        .populate('slotId')


        return result as Appointment[]
      }


      async loadAppointments():Promise<Appointment[]>{

        const result=await this.appointmentModel.find()

        .populate('patientId')
        .populate('doctorId')
        .populate('slotId')
      
 
        return result as Appointment[]


      }
      



      
      
    
      







    
}
