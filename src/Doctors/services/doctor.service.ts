/* eslint-disable prettier/prettier */
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DoctorModel } from '../schema/doctor.schema';
import * as bcrypt from 'bcrypt';
import { DoctorRegistrationDto,ResponseDto, loginDoctorDto } from '../Dto/createDoctor';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';

export class DoctorService {
    constructor(
        @InjectModel('Doctor') private readonly doctorModel: Model<DoctorModel>,
        private readonly _jwtService: JwtService,
        private  readonly mailservice:MailService

      
      ) {}


      async loadDoctorDatas(): Promise<void> {
        console.log("service file")
        // Fetch all doctors from the database
        const doctors = await this.doctorModel.find().exec();
    
        // Map the fetched doctors to the DoctorRegistrationDto
        const doctorData: any = doctors.map(doctor => ({
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
    
        // Return the response DTO
        return doctorData
        
      }



    async CreateDoctor(registerDoctorDto: DoctorRegistrationDto): Promise<ResponseDto> {
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
          await this.mailservice.sendWelcomeEmail(email,otherPersonalDetails.lastname,content); 


          // Return response according to createDoctorDto
          return {
            success: true,
            message: "Doctor registered successfully",
            data:{
                _id:newDoctor._id.toString(),
                personalDetailes:newDoctor.personalDetails,
                generalDetails:newDoctor.generalDetails,
                professionalDetales:newDoctor.professionalDetails

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


      async loginDoctor(loginDatas: loginDoctorDto): Promise<ResponseDto> {
        const { email, password } = loginDatas;
       
      
        const ExistingDoctor = await this.doctorModel.findOne({'personalDetails.email': email}).exec();
      
        if (ExistingDoctor) {
          const passwordMatch = await bcrypt.compare(password, ExistingDoctor.personalDetails.password);
      
          if (passwordMatch) {
            const payload = { userId: ExistingDoctor._id, email: ExistingDoctor.personalDetails.email,role:ExistingDoctor.personalDetails.role };
            const Token = this._jwtService.sign(payload);
      
            const { lastname } = ExistingDoctor.personalDetails;
            return {
              success: true,
              message: lastname + ' Logged In Successfully',
              data: {
                _id: ExistingDoctor._id.toString(),
                personalDetailes: ExistingDoctor.personalDetails,
                generalDetails: ExistingDoctor.generalDetails,
                professionalDetales: ExistingDoctor.professionalDetails
              },
              Token: Token
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
      
    
      







    
}
