/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DoctorModel } from '../schema/doctor.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { ObjectId } from 'mongodb';

import {
  AvailableTimeInterface,
  AvailableTimeResponse,
  combinedInterface,
  doctorLogin,
  doctorrequestsResponseDto,
  DoctorStatistics,
  generalDetails,
  personalDetails,
  professionalDetails,
  Slot,
  UpcomingAppointmentOverView,
} from '../interfaces/DoctorInterface';
import { types } from 'util';
import { promises } from 'dns';
import {
  Appointment,
  AppointmentResponse,
  commonResponse,
} from 'src/Users/Interfaces/UserInterface';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import internal from 'stream';
import { AppointmentSchema } from 'src/Users/Schema/Appointment.Schema';
import { UserModel } from 'src/Users/Schema/user.Schema';
import { Wallet, WalletSchema } from 'src/Users/Schema/Wallet.schema';
import { existsSync } from 'fs';
import { Console } from 'console';
import {
  speciality,
  specialityDocument,
} from 'src/Admin/Schema/speciality.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

export class DoctorService {
  constructor(
    @InjectModel('Doctor') private readonly doctorModel: Model<DoctorModel>,
    @InjectModel('availableTimes')
    private readonly AvailableTimeModel: Model<AvailableTimeInterface>,
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel('wallet') private readonly walletModel: Model<Wallet>,
    @InjectModel('User') private userModel: Model<UserModel>,
    private readonly _jwtService: JwtService,
    private readonly mailservice: MailService,
    @InjectModel(speciality.name)
    private SpecialityModel: Model<specialityDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async loadDoctorDatas(): Promise<void | InternalServerErrorException> {
    try {
      console.log('Here in DoctorServi');
      const doctors = await this.doctorModel.find().exec();

      // Map the fetched doctors to the DoctorRegistrationDto
      const doctorData: any = doctors.map((doctor) => ({
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
          regCancelreason: doctor.personalDetails.regCancelreason,
          isRegcancelled: doctor.personalDetails.isRegcancelled,
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
          specialisedDepartment:
            doctor.professionalDetails.specialisedDepartment,
          bio: doctor.professionalDetails.bio,
          MedicalDocument:doctor.professionalDetails.MedicalDocument,
          totalExperience: doctor.professionalDetails.totalExperience,
          patientsPerDay: doctor.professionalDetails.patientsPerDay,
          consultationFee: doctor.professionalDetails.consultationFee,
        },
      }));

      // Return the response DTO
      return doctorData;
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error,Try Again',
      );
    }
  }

  async getDoctorStatistics(doctorId: string) {
    const parsedDoctorId = new ObjectId(doctorId);
    const appointments = await this.appointmentModel
      .find({ doctorId: parsedDoctorId })
      .exec();

    console.log(appointments.length);
    const totalAppointments = appointments.length;

    const totalEarning = appointments
      .filter((appointment) => appointment.paymentStatus === 'paid')
      .reduce((sum, appointment) => sum + appointment.totalAmount, 0);

    const uniquePatients = await this.appointmentModel.distinct('patientId', {
      doctorId: doctorId,
    });

    const totalPatients = uniquePatients.length;

    return {
      totalAppointments: totalAppointments,
      totalEarnings: totalEarning,
      totalPatients: totalPatients,
    };
  }

  async getfetchUpcomingAppointmentOverview(doctorId: string):Promise<UpcomingAppointmentOverView[]> {
    try {
      const parsedDoctorId = new ObjectId(doctorId);
  
      // Find the doctor by ID
      const doctor = await this.doctorModel.findById(parsedDoctorId).exec();
      
      if (doctor) {
        // Find upcoming appointments for the doctor
        const appointments = await this.appointmentModel.find({
          doctorId: parsedDoctorId,
          consultaionStatus: 'upcoming',
        })
          .populate({
            path: 'patientId',   
            select: 'firstName lastName profileImage'  
          })
          .populate('doctorId')
          .populate('slotId')
          .limit(3) 
          .exec();
        const upcomingAppointmentOverview = appointments.map(appointment => ({
          ProfileImage: appointment.patientId['profileImage'],
          consultationType:appointment.consultationType,
          firstName: `${appointment.patientId['firstName']}`,
          lastName: `${appointment.patientId['lastName']}`,  
          day: appointment.slotId.day,  
          Time: appointment.slotId.startTime 
        }));
  
        return upcomingAppointmentOverview
        
      } else {
        throw new Error('Doctor not found');
      }
    } catch (error) {
      console.error("Error fetching upcoming appointment overview: ", error);
      throw new Error("Could not fetch upcoming appointment overview");
    }
  }
  
  
  async loadDoctorData(doctorId: string): Promise<doctorrequestsResponseDto> {
    try {
      const parsedDoctorId = new ObjectId(doctorId);
      console.log('gfdhcbjdefbcvhjdebvc///', parsedDoctorId);
      const Doctor = await this.doctorModel
        .findOne({ _id: parsedDoctorId })
        .exec();
      console.log('Doctor', Doctor);
      return {
        success: true,
        message: 'Doctor registered successfully',
        data: {
          _id: Doctor._id.toString(),
          personalDetails: {
            firstName: Doctor.personalDetails.firstName,
            lastName: Doctor.personalDetails.lastName,
            email: Doctor.personalDetails.email,
            gender: Doctor.personalDetails.gender,
            contactNumber: Doctor.personalDetails.contactNumber,
            dateofBirth: Doctor.personalDetails.dateofBirth,
            regCancelreason: Doctor.personalDetails.regCancelreason,
            profileImage: Doctor.personalDetails.profileImage,
          },
          generalDetails: {
            city: Doctor.generalDetails.city,
            state: Doctor.generalDetails.state,
            country: Doctor.generalDetails.country,
            zipcode: Doctor.generalDetails.zipcode,
            adharNumber: Doctor.generalDetails.adharNumber,
          },
          professionalDetails: {
            medicalLicenceNumber:
              Doctor.professionalDetails.medicalLicenceNumber,
            specialisedDepartment:
              Doctor.professionalDetails.specialisedDepartment,
            bio: Doctor.professionalDetails.bio,
            MedicalDocument:Doctor.professionalDetails.MedicalDocument,
            totalExperience: Doctor.professionalDetails.totalExperience,
            patientsPerDay: Doctor.professionalDetails.patientsPerDay,
            consultationFee: Doctor.professionalDetails.consultationFee,
          },
        },
      };
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error,Try Again',
      );
    }
  }

  async getAppointmentsByDoctorAndStatus(
    doctorId: string,
    status: string,
    currentPage:number,
    limit:number
  ): Promise<AppointmentResponse | InternalServerErrorException> {
    try {
      console.log('doctorId',doctorId)
      console.log('status////',status)
      const parsedId = new ObjectId(doctorId);
    const skip = (currentPage - 1) * limit;
    const appointments = await this.appointmentModel
      .find({ doctorId: parsedId, consultaionStatus: status })
      .populate('doctorId')
      .populate('patientId')
      .populate('slotId')
      .skip(skip)
      .limit(limit)
      .exec();
 console.log("Lengthddd",appointments.length)

      const totalAppointmentcount=await this.appointmentModel.countDocuments({doctorId:parsedId,consultaionStatus: status})


      const totalPages = Math.ceil(totalAppointmentcount / limit);
      console.log(totalAppointmentcount)
      console.log(totalPages)
      console.log(currentPage);
      ;
      
      return {
      appointments:appointments,
      totalAppointmentcount,
      totalPages,
      currentPage,
      
    } 
  }catch (error) {
    console.log(error)
    return new InternalServerErrorException(
      'Internal Server Error,Try Again',
    );
      
  }
    


  }


  async fetchMypatients(doctorId: string, currentPage: number, limit: number) {
    try {
      const parsedId = new ObjectId(doctorId);
      const skip = (currentPage - 1) * limit;
  
     
      const uniquePatientIds = await this.appointmentModel.distinct('patientId', {
        doctorId: parsedId,
      });
      const totalPatientsCount=uniquePatientIds.length
  
      console.log('limit///',limit)
      console.log('Unique Patient IDs:', uniquePatientIds);
      const totalPages = Math.ceil(totalPatientsCount / limit);
      console.log('totalPatientsCount//',totalPatientsCount)
      console.log('totalPages//',totalPages)
      const patients = await this.userModel.find({
        _id: { $in: uniquePatientIds },
      })
      .skip(skip)
      .limit(limit);

      return {
        patients,
        totalPatientsCount,
        totalPages,
        currentPage
      }
  
      
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error, Try Again',
      );
      
      
    }

  }

  async changePassword(body: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
    doctorId: string;
  }): Promise<commonResponse> {
    try {
      const { oldPassword, newPassword, confirmPassword, doctorId } = body;

      const ExistingUser = await this.doctorModel
        .findOne({ _id: doctorId })
        .exec();

      const isPasswordValid = await bcrypt.compare(
        oldPassword,
        ExistingUser.personalDetails.password,
      );

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Old password is incorrect please check',
        };
      }

      // Check if newPassword and confirmPassword match
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: 'newPassword and confirmPassword are not match',
        };
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      ExistingUser.personalDetails.password = hashedNewPassword;
      await ExistingUser.save();
      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error,Try Again',
      );
    }
  }


  async updatepersonalDetailes(editedpersonalDetails: personalDetails, DoctorId: string) {
    try {
      const parsedDoctorId = new ObjectId(DoctorId);
      console.log()
  
     
      const existingDoctor = await this.doctorModel.findById(parsedDoctorId);
  
      if (!existingDoctor) {
        return {
          success: false,
          message: 'Doctor not found'
        };
      }
  
      console.log('editedpersonalDetails????',editedpersonalDetails)
      const updatedPersonalDetails = {
        ...existingDoctor.personalDetails,
        ...editedpersonalDetails,  
      };
     
  
    
      await this.doctorModel.findOneAndUpdate(
        { _id: parsedDoctorId }, 
        { $set: { personalDetails: updatedPersonalDetails } }, 
        { new: true }  
      );
  
      return {
        success: true,
        message: 'Personal Details Updated Successfully',
      };
  
    } catch (error) {
      console.error("Error updating personal details: ", error);
      throw new Error("Could not update personal details");
    }
  }
  
  
  async updategeneralDetailes(editedGeneralDetails: generalDetails, DoctorId: string) {
    try {
      const parsedDoctorId = new ObjectId(DoctorId);
      
   
      const existingDoctor = await this.doctorModel.findById(parsedDoctorId);
    
      if (!existingDoctor) {
        return {
          success: false,
          message: 'Doctor not found',
        };
      }
  
     
      const mergedGeneralDetails = {
        ...existingDoctor.generalDetails,
        ...editedGeneralDetails
      };
  
      // Check if any changes have been made
      const isUnchanged = JSON.stringify(existingDoctor.generalDetails) === JSON.stringify(mergedGeneralDetails);
  
      if (isUnchanged) {
        return {
          success: true,
          message: 'No changes were made to the general details',
        };
      }
  
    
      const updatedDoctor = await this.doctorModel.findOneAndUpdate(
        { _id: parsedDoctorId }, 
        { $set: { generalDetails: mergedGeneralDetails } }, 
        { new: true } // Return the updated document
      );
  
      return {
        success: true,
        message: 'General details updated successfully',
        updatedDoctor,
      };
  
    } catch (error) {
      console.error("Error updating general details: ", error);
      throw new Error("Could not update general details");
    }
  }

  async updateProfessionalDetails(editedProfessionalDetails:professionalDetails,DoctorId:string){
    try {
      const parsedDoctorId = new ObjectId(DoctorId);
      
   
      const existingDoctor = await this.doctorModel.findById(parsedDoctorId);
    
      if (!existingDoctor) {
        return {
          success: false,
          message: 'Doctor not found',
        };
      }
  
     
      const mergedProfessionalDetails = {
        ...existingDoctor.professionalDetails,
        ...editedProfessionalDetails
      };
  
      // Check if any changes have been made
      const isUnchanged = JSON.stringify(existingDoctor.professionalDetails) === JSON.stringify(mergedProfessionalDetails);
  
      if (isUnchanged) {
        return {
          success: true,
          message: 'No changes were made to the general details',
        };
      }
  
      // Update only the changed fields in generalDetails
      const updatedDoctor = await this.doctorModel.findOneAndUpdate(
        { _id: parsedDoctorId }, 
        { $set: { professionalDetails: mergedProfessionalDetails } }, 
        { new: true } 
      );
  
      return {
        success: true,
        message: 'Professional details updated successfully',
        updatedDoctor,
      };
  
      
      
    } catch (error) {
      
    }
  }
  
  async uploadProfileImage(
    file:Express.Multer.File,
    DoctorId:string
  ):Promise<commonResponse>{
    const parsedDoctorId = new ObjectId(DoctorId);
try {
  if(parsedDoctorId){
    const Doctor=await this.doctorModel.findById({_id:parsedDoctorId}).exec()
    if(Doctor){
      const response = await this.cloudinaryService.uploadFile(file);
      Doctor.personalDetails.profileImage=response.url
      await Doctor.save()
      return {
        success: true,
        message: 'Profile image uploaded successfully',
      };

    }else{
      return {
        success: false,
        message: 'Invalid User ID',
      };

    }
  }
} catch (error) {
  console.error('Error uploading profile image:', error);
      return {
        success: false,
        message: 'Error uploading profile image',
      };
  
}
   
  }


  async fetchDepartments(): Promise<string[]> {
    try {
      const departments = await this.SpecialityModel.find().exec();
      return departments.map(department => department.specialityName);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch departments.');
    }
  }
  async fetchTransactions(doctorId: string,currentPage,limit){
    try {

      if (!doctorId || !ObjectId.isValid(doctorId)) {
        throw new Error('Invalid doctorId');
      }
      const parsedDoctorId = new ObjectId(doctorId);
  
      const skip = (currentPage - 1) * limit;
      const appointmentDetails = await this.appointmentModel
        .find({ doctorId: parsedDoctorId })
        .populate('patientId')
        .skip(skip)
        .limit(limit)

      const totalAppointmentcount=await this.appointmentModel.countDocuments({
        doctorId: parsedDoctorId
      })
      const totalPages = Math.ceil(totalAppointmentcount / limit);
  

      const transactions = appointmentDetails.map(appointment => ({
        _id: appointment._id.toString(), 
        patientId:appointment.patientId,
        consultationType: appointment.consultationType,
        consultationStatus: appointment.consultaionStatus,
        isCancelledbypatient: appointment.isCancelledbypatient,
        iscancelledbyDoctor: appointment.iscancelledbyDoctor,
        PaymentMethod: appointment.PaymentMethod,
        paymentStatus: appointment.paymentStatus,
        amount: appointment.totalAmount, 
      }));
     console.log(transactions)
      return{
        transactions,
        totalAppointmentcount,
        totalPages,
        currentPage,
      } 
  
    } catch (error) {
      console.error('Error fetching transactions:', error.message); 
      throw new Error('Failed to fetch transactions');
    }
  }


  async fetchSearchResults(searchTerm: string, doctorId: string, currentPage: number, limit: number) {
    try {
      const parsedDoctorId = new ObjectId(doctorId);
  
      const skip = (currentPage - 1) * limit;
  
      // Fetch all transactions by doctorId and populate patient details
      const allTransactions = await this.appointmentModel.find({
        doctorId: parsedDoctorId,
      }).populate('patientId', 'firstName lastName profileImage');
  
      // Convert the searchTerm to lowercase for case-insensitive comparison
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
      // Filter the transactions based on the search term
      const filteredTransactions = allTransactions.filter((appointment) => {
        const patientFirstName = appointment.patientId['firstName'];
        const patientLastName = appointment.patientId['lastName'];
        const consultationStatus = appointment.consultaionStatus;
        const consultationType = appointment.consultationType;
  
        // Check if any of the fields include the search term
        return (
          patientFirstName.toLowerCase().includes(lowerCaseSearchTerm) ||
          patientLastName.toLowerCase().includes(lowerCaseSearchTerm) ||
          consultationStatus.toLowerCase().includes(lowerCaseSearchTerm) ||
          consultationType.toLowerCase().includes(lowerCaseSearchTerm)
        );
      });
  
      // Apply pagination to the filtered transactions
      const paginatedTransactions = filteredTransactions.slice(skip, skip + limit);
      const totalFilteredCount = filteredTransactions.length;
      const totalPages = Math.ceil(totalFilteredCount / limit);
  
      const transactions = paginatedTransactions.map(appointment => ({
        _id: appointment._id.toString(),
        patientId: appointment.patientId,
        consultationType: appointment.consultationType,
        consultationStatus: appointment.consultaionStatus,
        isCancelledbypatient: appointment.isCancelledbypatient,
        iscancelledbyDoctor: appointment.iscancelledbyDoctor,
        PaymentMethod: appointment.PaymentMethod,
        paymentStatus: appointment.paymentStatus,
        amount: appointment.totalAmount,
      }));
  
      return {
        transactions,
        totalAppointmentcount: totalFilteredCount,
        totalPages,
        currentPage,
      };
    } catch (error) {
      console.error('Error fetching search results:', error.message);
      throw new Error('Failed to fetch search results');
    }
  }
  
  
  
  
  
  

  
    async CreateDoctor(
      registerDoctorDto: combinedInterface,
      file: Express.Multer.File
    ): Promise<doctorrequestsResponseDto> {
      try {
        const { email, password, ...otherPersonalDetails } = registerDoctorDto.personalDetails;
  
        // Check if password is provided
        if (!password) {
          throw new Error('Password is missing or undefined');
        }
        console.log('Password:', password); // Log for debugging
  
        // Check for existing doctor
        const existingDoctor = await this.doctorModel
          .findOne({ 'personalDetails.email': email })
          .exec();
  
        if (existingDoctor) {
          return {
            success: false,
            message: 'Doctor already exists. Please log in.',
          };
        }
  
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Hashed password:', hashedPassword); // Log hashed password
  
        // Upload document to Cloudinary
        const uploadedFile = await this.cloudinaryService.uploadFile(file);
        const MedicalDocument = uploadedFile.url;
  
        // Create new doctor document
        const newDoctor = new this.doctorModel({
          personalDetails: {
            ...otherPersonalDetails,
            email,
            role: 'Doctor',
            password: hashedPassword,
          },
          generalDetails: registerDoctorDto.generalDetails,
          professionalDetails: {
            ...registerDoctorDto.professionalDetails,
            MedicalDocument,
          },
        });
  
        await newDoctor.save();
  
        // Send welcome email
        const content = 'Welcome to Doccure Care Service. You will receive an email after verification.';
        await this.mailservice.sendWelcomeEmail(email, otherPersonalDetails.lastName, content);
  
        return {
          success: true,
          message: 'Doctor registered successfully',
          data: {
            _id: newDoctor._id.toString(),
            personalDetails: newDoctor.personalDetails,
            generalDetails: newDoctor.generalDetails,
            professionalDetails: newDoctor.professionalDetails,
          },
        };
      } catch (error) {
        console.error('Error creating doctor:', error);
        throw new InternalServerErrorException('Internal Server Error. Please try again.');
      }
    }
  
  
  
  


  async findByEmail(email: string): Promise<any | null> {
    try {
      return await this.doctorModel
        .findOne({ 'personalDetails.email': email })
        .lean()
        .exec();
    } catch (error) {
      return new InternalServerErrorException('Internal Server Error');
    }
  }
  async loginDoctor(
    loginDatas: doctorLogin,
  ): Promise<doctorrequestsResponseDto> {
    try {
      const { email, password } = loginDatas;

      // Find the doctor by email
      const existingDoctor = await this.doctorModel
        .findOne({ 'personalDetails.email': email })
        .exec();

      // Check if the doctor exists
      if (!existingDoctor) {
        return {
          success: false,
          message: 'Doctor is not registered, please register',
        };
      }

      // Check if registration is cancelled
      if (existingDoctor.personalDetails.isRegcancelled) {
        return {
          success: false,
          message: `Unfortunately, your registration was cancelled by Admin: ${existingDoctor.personalDetails.regCancelreason}`,
        };
      }

      // Check if the doctor is approved
      if (!existingDoctor.personalDetails.isApproved) {
        return {
          success: false,
          message: 'You are not approved yet.',
        };
      }

      // Compare passwords
      const passwordMatch = await bcrypt.compare(
        password,
        existingDoctor.personalDetails.password,
      );

      // Check if the password matches
      if (!passwordMatch) {
        return {
          success: false,
          message: 'Invalid credentials, please try again',
        };
      }

      // Create JWT payload
      const payload = {
        userId: existingDoctor._id.toString(),
        email: existingDoctor.personalDetails.email,
        role: existingDoctor.personalDetails.role,
      };

      // Sign the token
      const token = this._jwtService.sign(payload);

      const { lastName } = existingDoctor.personalDetails;

      return {
        success: true,
        message: `${lastName} logged in successfully`,
        data: {
          _id: existingDoctor._id.toString(),
          personalDetails: existingDoctor.personalDetails,
          generalDetails: existingDoctor.generalDetails,
          professionalDetails: existingDoctor.professionalDetails,
        },
        Token: token,
      };
    } catch (error) {
      console.error('Error during doctor login:', error); // Log the error for debugging
      throw new InternalServerErrorException(
        'Internal Server Error, please try again',
      );
    }
  }

  async createAvailableTime(
    availableTimeData: AvailableTimeInterface,
  ): Promise<AvailableTimeResponse | InternalServerErrorException> {
    try {
      const { startTime, endTime, day, doctorId } = availableTimeData;

      // Find overlapping time slots
      const overlappingSlots = await this.AvailableTimeModel.find({
        day,
        doctorId,
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } }, // Partial overlap at the start
          { endTime: { $gt: startTime, $lte: endTime } }, // Partial overlap at the end
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } }, // Full overlap
        ],
      }).exec();

      // If overlapping slots are found
      if (overlappingSlots.length > 0) {
        // Identify the overlapping times
        const overlappingTimes = overlappingSlots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));

        let newStartTime = startTime;
        let newEndTime = endTime;

        overlappingSlots.forEach((slot) => {
          if (slot.startTime <= newStartTime && slot.endTime >= newEndTime) {
            newStartTime = null;
          } else if (
            slot.endTime > newStartTime &&
            slot.startTime < newEndTime
          ) {
            if (slot.startTime <= newStartTime) {
              newStartTime = slot.endTime;
            } else if (slot.endTime >= newEndTime) {
              newEndTime = slot.startTime;
            }
          }
        });

        if (newStartTime && newEndTime && newStartTime < newEndTime) {
          const availableTiming = new this.AvailableTimeModel({
            day,
            startTime: newStartTime,
            endTime: newEndTime,
            doctorId,
          });
          await availableTiming.save();

          return {
            message: `A partial slot was created from ${newStartTime} to ${newEndTime}. Some time slots already existed.`,
            success: true,
          };
        } else {
          return {
            message:
              'The entire time range is already occupied by existing slots.',
            success: false,
          };
        }
      }

      const availableTiming = new this.AvailableTimeModel({
        day,
        startTime,
        endTime,
        doctorId,
      });

      await availableTiming.save();
      return {
        message: 'Slot created successfully',
        success: true,
      };
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error, Try Again',
      );
    }
  }

  async getSlots(
    day: string,
    doctorId: string,
  ): Promise<AvailableTimeResponse | InternalServerErrorException> {
    try {
      const parsedId = new ObjectId(doctorId);
      const result = await this.AvailableTimeModel.find({
        day: day,
        doctorId: parsedId,
      }).exec();

      const slots: Slot[] = result.map((slot) => ({
        _id: slot._id.toString(),
        DoctorId: slot.doctorId,
        startTime: slot.startTime,
        isBooked: slot.isBooked,
        endTime: slot.endTime,
      }));

      return {
        slots,
        success: true,
        message: '',
      };
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error,Try Again',
      );
    }
  }

  async deleteAllSlots(
    day: string,
    doctorId: string,
  ): Promise<AvailableTimeResponse | InternalServerErrorException> {
    try {
      const parsedDoctorId = new ObjectId(doctorId);

      const result = await this.AvailableTimeModel.deleteMany({
        day,
        doctorId: parsedDoctorId,
      });

      if (!result) {
        return {
          success: false,
          message: 'Delete Failed',
        };
      } else {
        return {
          success: true,
          message: 'Slots Deleted SuccessFully',
        };
      }
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error,Try Again',
      );
    }
  }

  async deleteSlot(
    day: string,
    doctorId: string,
    Slotid: string,
  ): Promise<AvailableTimeResponse> {
    try {
      const objectIdSlot = new ObjectId(Slotid);
      const objectIdDoctor = new ObjectId(doctorId);

      const existing = await this.AvailableTimeModel.findOne({
        _id: objectIdSlot,
      });

      if (!existing) {
        return { success: false, message: 'Slot not found' };
      }

      // Delete the slot
      await this.AvailableTimeModel.deleteOne({ _id: Slotid });

      return { success: true, message: 'Slot deleted successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to delete slot' };
    }
  }

 

  async getAppointments(
    DoctorId: string,
    currentPage: number,
    limit: number,
  ): Promise<AppointmentResponse | InternalServerErrorException> {
    try {

      const parsedDoctorId = new ObjectId(DoctorId);
      const skip = (currentPage - 1) * limit;
      const totalAppointments = await this.appointmentModel
        .find({ doctorId: parsedDoctorId })
        .populate('doctorId')
        .populate('patientId')
        .populate('slotId')
        .skip(skip)
        .limit(limit)
        const totalAppointmentcount=await this.appointmentModel.countDocuments({doctorId:parsedDoctorId})
       
        const totalPages = Math.ceil(totalAppointmentcount / limit);
        console.log('totalAppointments?>././.',totalAppointments)
      return {
        appointments:totalAppointments,
        totalAppointmentcount,
        totalPages,
        currentPage,
       

        


      }
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error,Try Again',
      );
    }
  }

  async loadAppointments(): Promise<
    Appointment[] | InternalServerErrorException
  > {
    try {
      const result = await this.appointmentModel
        .find()

        .populate('patientId')
        .populate('doctorId')
        .populate('slotId');

      return result as Appointment[];
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error,Try again',
      );
    }
  }

  async cancelAppointment(payload) {
    const { appointmentId, reason, doctorId, patientId } = payload;
    let userwallet;
    const parseddoctorId = new ObjectId(doctorId);
    const parsedAppointmentId = new ObjectId(appointmentId);
    const parsedpatientId = new ObjectId(patientId);
    const doctor = await this.doctorModel.findById(parseddoctorId).exec();
    try {
      const appointment = await this.appointmentModel
        .findOne({ _id: parsedAppointmentId, patientId: parsedpatientId })
        .populate('doctorId')
        .exec();

      appointment.cancellationReason = reason;
      appointment.iscancelledbyDoctor = true;
      appointment.consultaionStatus = 'cancelled';
      if (
        appointment.PaymentMethod == 'wallet' ||
        appointment.PaymentMethod === 'razorepay'
      ) {
        userwallet = await this.walletModel
          .findOne({ userId: parsedpatientId })
          .populate('userId')
          .exec();

        if (!userwallet) {
          throw new Error('wallet not found');
        }
        const transaction = userwallet.transactions.find(
          (trans) =>
            trans.appointmentId.toString() === parsedAppointmentId.toString(),
        );
        if (!transaction) {
          throw new Error('transaction not found');
        }
        const transactionAmount = transaction.amount;
        userwallet.balance = userwallet.balance + transactionAmount;

        const newTransaction = {
          transactionId: new ObjectId(),
          amount: transactionAmount,
          type: 'Credit' as const,
          description: 'Refund for cancelled appointment',
          appointmentId: parsedAppointmentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await userwallet.save();
        await appointment.save();
        const content = `your Appointment is cancelled,becouse the Doctor  have ${reason}  We sincerely apologize for any inconvenience this may cause. However, we want to ensure that your consultation happens at a time that works for both you and the doctor. You can easily reschedule your appointment by booking another available time slot,Your refund for the cancelled appointmentment will be credited to your wallet within 24 hours`;
        await this.mailservice.sendWelcomeEmail(
          userwallet.userId.email,
          userwallet.userId.firstName,
          content,
        );

        return {
          success: true,
          message:
            'Your refund for the cancellation will be credited to your wallet within 24 hours',
        };
      } else {
        appointment.iscancelledbyDoctor = true;
        appointment.cancellationReason = reason;
        await appointment.save();
        const content = `your Appointment is cancelled,becouse the Doctor  have ${reason}  We sincerely apologize for any inconvenience this may cause. However, we want to ensure that your consultation happens at a time that works for both you and the doctor. You can easily reschedule your appointment by booking another available time slot`;
        await this.mailservice.sendWelcomeEmail(
          userwallet.userId.email,
          userwallet.userId.firstName,
          content,
        );
        return {
          success: true,
          message: 'Your refund for the cancellation compleated',
        };
      }

      {
      }
    } catch (error) {
      console.error('Error during appointment cancellation:', error);
      return new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
    }
  }

  async blockUser(patientId: string): Promise<commonResponse> {
    try {
      const parsedId = new ObjectId(patientId);
      const patient = await this.userModel.findOne({ _id: parsedId }).exec();
      if (patient) {
        if (patient.isBlocked) {
          patient.isBlocked = false;
          await patient.save();
          return {
            success: true,
            message: 'user has been unblocked Successfully',
          };
        } else {
          patient.isBlocked = true;
          await patient.save();
          return {
            success: true,
            message: 'user has been blocked Successfully',
          };
        }
      } else {
        return {
          success: false,
          message: 'patient not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'something errorwhile chnaging status',
      };
    }
  }
}
