/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */

import { Type } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";


export class loginDoctorDto{
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

}








export class PersonalDetailsDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @IsNotEmpty()
  @IsDate()
  dateOfBirth: Date;

  @IsNotEmpty()
  @IsString()
  password: string;
  
  profileImage:string;
  isApproved:Boolean;
  isBlocked:Boolean;
  role:string;
  

}



export class GeneralDetailsDto {
    @IsNotEmpty()
    @IsString()
    city: string;
  
    @IsNotEmpty()
    @IsString()
    state: string;
  
    @IsNotEmpty()
    @IsString()
    country: string;
  
    @IsNotEmpty()
    @IsString()
    zipcode: string;
  
    @IsNotEmpty()
    @IsString()
    adharNumber: string;
  }


  export class ProfessionalDetailsDto {
    @IsNotEmpty()
    @IsString()
    medicalLicenceNumber: string;

    @IsNotEmpty()
    @IsString()
    specialisedDepartment:string
  
    @IsNotEmpty()
    @IsNumber()
    totalExperience: number;
  
    @IsNotEmpty()
    @IsNumber()
    patientsPerDay: number;
  
    @IsNotEmpty()
    @IsNumber()
    consultationFee: number;
  }

  export class DoctorRegistrationDto {

     _id:string;

    @ValidateNested()
    @Type(() => PersonalDetailsDto)
    personalDetails: PersonalDetailsDto;
  
    @ValidateNested()
    @Type(() => GeneralDetailsDto)
    generalDetails: GeneralDetailsDto;
  
    @ValidateNested()
    @Type(() => ProfessionalDetailsDto)
    professionalDetails: ProfessionalDetailsDto;
  

  }
  






export class DoctorRequestsResponseDto {
  success: boolean;
  message: string;

  @ValidateNested({ each: true })
  @Type(() => DoctorRegistrationDto)
  data: DoctorRegistrationDto[]; 

  Token?: string; 
}


export class ResponseDto {
  success: boolean;
  message: string;
  data?:{
    _id?:string,
    personalDetailes?:PersonalDetailsDto,
    generalDetails?:GeneralDetailsDto,
    professionalDetales?:ProfessionalDetailsDto
  }
  Token?:string;

}






