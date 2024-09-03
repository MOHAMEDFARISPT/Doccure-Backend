/* eslint-disable prettier/prettier */


import { IsString, IsEmail,  IsDate,  MinLength } from 'class-validator';




export enum Gender{
  MALE="male",
  FEMALE="female",
  OTHER="other"
  
}


export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  gender: string;

  @IsDate()
  dateOfBirth: Date;

  @IsString()
  contactNumber: string;

  @IsString()
  password: string;
  
  @IsString()
  confirmPassword: string;
  
  @IsString()
  profileImage:string

  isGoogle:boolean
  isBlocked:boolean

}


//create User ResponseDto
export  interface commonResponse {
  success: boolean;
  message: string;
}

export interface userdatainterface{
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

export interface createUserResponseDto extends  commonResponse{
 
  data?:userdatainterface
}


















export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}


// Define the Login Response DTO
export class LoginResponseDto {
  success: boolean;
  message: string;
  data?:{
    _id:string;
    firstname:string;
    lastname:string;
    contactnumber:string;
    gender:string;
    dateofbirth:Date;
    email:string;


  };
  Token?:string
}














  