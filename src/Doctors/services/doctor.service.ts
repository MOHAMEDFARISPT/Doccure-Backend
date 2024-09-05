/* eslint-disable prettier/prettier */
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DoctorModel } from '../schema/doctor.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';

import { AvailableTime, combinedInterface, doctorLogin, doctorrequestsResponseDto } from '../interfaces/DoctorInterface';

export class DoctorService {
    constructor(
        @InjectModel('Doctor') private readonly doctorModel: Model<DoctorModel>,
        @InjectModel('availableTimes') private readonly availabletimes:Model<AvailableTime>,
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
            totalExperience: doctor.professionalDetails.totalExperience,
            patientsPerDay: doctor.professionalDetails.patientsPerDay,
            consultationFee: doctor.professionalDetails.consultationFee,
          },
        }));
    
        // Return the response DTO
        return doctorData
        
      }



    async CreateDoctor(registerDoctorDto: combinedInterface): Promise<doctorrequestsResponseDto> {
      console.log("registerDoctorDto/////",registerDoctorDto)
        const { email, password, ...otherPersonalDetails } = registerDoctorDto.personalDetails;
        console.log(email,password)
      
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

            console.log("payload///",payload)
      
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




      createAvailableTime(availableTimeData:AvailableTime){
        console.log("availableTimeData",availableTimeData)
        

      }
      
    
      







    
}
