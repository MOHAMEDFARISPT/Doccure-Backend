/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */

import { ObjectId } from "mongoose";







export interface doctorLogin{
    email:string;
    password:string
  }
  
  
  
  export interface DoctorResponse {
    doctors: combinedInterface[];     
    totalDoctorsCount: number; 
    totalPages: number;         
    currentPage: number;       
  }


  export interface TransactionDetails {
    _id: string; 
    patientId: string | { 
      firstName: string;
      profileImage: string;
    };
    consultationType: string;
    consultationStatus: string;
    isCancelledbypatient: boolean;
    iscancelledbyDoctor: boolean;
    PaymentMethod: string;
    paymentStatus: string;
    amount: number;
  }
  export interface TransactionResponse {
    transactions: TransactionDetails[]; 
    totalAppointmentcount: number; 
    totalPages: number; 
    currentPage: number; 
  }
  
  

  
  
  
  export interface responseData {
    _id?: ObjectId;
    personalDetails?: personalDetails;
    generalDetails?: generalDetails;
    professionalDetails?: professionalDetails;
  }
  
  
  export interface personalDetails {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    contactNumber: string;
    dateofBirth: Date;
    password?: string;
    profileImage?: string;
    isApproved?: Boolean;
    isBlocked?: Boolean;
    isFavourite?:boolean;
    regCancelreason?:string;
    role?: string;
  }
  
  export interface generalDetails {
    city: string;
    state: string;
    country: string;
    zipcode: string;
    adharNumber: string;
  }
  
  export interface professionalDetails {
    medicalLicenceNumber: string;
    specialisedDepartment: string;
    bio:string;
    totalExperience: number;
    MedicalDocument: string;
    patientsPerDay: number;
    consultationFee: number;
  }
  
  export interface combinedInterface{
    _id?:string,
    personalDetails:personalDetails,
    generalDetails:generalDetails,
    professionalDetails:professionalDetails,

  
  }
  export interface DoctorStatistics {
    totalPatients: number;
    totalAppointments: number;
    totalEarnings: number;
  }
  
  
  
  
  export interface doctorrequestsResponseDto{
    success?: boolean;
    message?: string;
     data?:combinedInterface | combinedInterface[]
     Token?: string; 
     refreshToken?:string;
  }
  


  export interface AvailableTimeInterface {
    day: string;
    startTime: string;
    endTime: string;
    doctorId: string; 
    isBooked?:boolean
  }

  export interface Slot {
    _id: string;  
    startTime: string;
    endTime: string;
    DoctorId:string;
    isBooked?:boolean
  }
  
  // Interface for the response
  export interface AvailableTimeResponse {
    slots?: Slot[];
    success: boolean;
    message: string;
  }

   
export interface UpcomingAppointmentOverView{
  ProfileImage:string;
  consultationType:string;
  firstName:string;
  lastName:string;
  day:string;
  Time:string;
}


  