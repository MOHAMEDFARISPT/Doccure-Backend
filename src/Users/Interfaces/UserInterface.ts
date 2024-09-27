/* eslint-disable prettier/prettier */

import { Types } from "mongoose";

export interface User  {
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: Date;
    contactNumber: string;
    email: string;
    password:string;
    role:string;
    profileImage:string;
    createdAt?: Date;
    updatedAt?: Date;
    isGoogle:boolean;
    isBlocked:boolean

  }


  export interface userlogin{
    email:string;
    password:string;
  }











  //create User ResponseDto
export  interface commonResponse {
  success?: boolean;
  message?: string;
}

export interface userdataResponseinterface{
  _id?:string;
  firstName?:string;
  lastName?:string;
  contactnumber?:string;
  gender?:string;
  dateofbirth?:Date;
  email?:string;
  profileImage?:string;
  accessToken?:string;
}

export interface createUserResponse extends  commonResponse{
 
  data?:userdataResponseinterface
}

export interface Appointmentcreation {
  patientId: string;        
  doctorId: string;        
  slotId: string;          
  totalAmount: number;      
  PaymentMethod: string;   
  paymentStatus: string;    
  consultationType: string; 
  cancellationReason?:string
}

  export interface Tempuser extends Document{
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: Date;
    contactNumber: string;
    email: string;
    password:string;
    confirmPassword:string;
    otp:string,
    otpExpires:Date,
    isOtpVerified:boolean;
    isBlocked:boolean;
    isGoogle:boolean;



  }



  interface Transaction {
    transactionId: string;
    amount: number;
    type: 'Debit' | 'Credit';
    description?: string;
  }
  
  // Interface for the Wallet model
  export interface IWallet {
    _id:string;        
    userId?:string;        
    balance: number;              
    transactions: Transaction[];   
    createdAt?: Date;              
    updatedAt?: Date;             
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
    isApproved?: boolean;
    isBlocked?: boolean;
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
    patientsPerDay: number;
    consultationFee: number;
  }

  export interface Doctor {
    _id: Types.ObjectId;
    personalDetails: personalDetails;
    generalDetails: generalDetails;
    professionalDetails: professionalDetails;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
  }
  
  
  export interface Slot {
    _id: Types.ObjectId;
    day: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    doctorId: Types.ObjectId;
    __v: number;
  }

  export interface Appointment {
    _id: Types.ObjectId;
    patientId: Types.ObjectId ; 
    doctorId: Doctor;
    slotId: Slot;
    totalAmount: number;
    PaymentMethod: string;
    paymentStatus: string;
    consultationType: string;
    consultaionStatus: string;
    isCancelled: boolean;
    cancellationReason?: string;
    __v: number;
  }

  