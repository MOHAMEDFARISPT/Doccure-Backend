/* eslint-disable prettier/prettier */

export interface User extends Document {
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
  

  