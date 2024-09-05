/* eslint-disable prettier/prettier */

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
  success: boolean;
  message: string;
}

export interface userdataResponseinterface{
  _id?:string;
  firstName?:string;
  lastname?:string;
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
  

  