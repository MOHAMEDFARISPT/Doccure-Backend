/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */






export interface doctorLogin{
    email:string;
    password:string
  }
  
  
  
  
  
  
  
  
  export interface responseData {
    _id?: string;
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
    password: string;
    profileImage?: string;
    isApproved?: Boolean;
    isBlocked?: Boolean;
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
  
  export interface combinedInterface{
    _id?:string,
    personalDetails:personalDetails,
    generalDetails:generalDetails,
    professionalDetails:professionalDetails
  
  }
  
  
  
  export interface doctorrequestsResponseDto{
    success?: boolean;
    message?: string;
     data?:combinedInterface | combinedInterface[]
     token?: string; 
  }
  


  export interface AvailableTimeInterface {
    day: string;
    startTime: string;
    endTime: string;
    doctorId: string; 
  }

  export interface Slot {
    _id: string;  
    startTime: string;
    endTime: string;
    DoctorId:string;
  }
  
  // Interface for the response
  export interface AvailableTimeResponse {
    slots?: Slot[];
    success: boolean;
    message: string;
  }


  