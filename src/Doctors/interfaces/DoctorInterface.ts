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
  


export interface AvailableTime{
  day: string;
  startTime: string;
  endTime: string;
  doctorId: string; 
}
