/* eslint-disable prettier/prettier */
export class CreateUserDto {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly gender: string;
    readonly dateOfBirth: Date;
    readonly password: string;
    readonly refreshToken: string;
    readonly medicalRecords?: string[];
    readonly appointments?: string[];
    readonly wallet?: string[];
    readonly profileImage?: string;
  }

  export class loginDto{
    readonly email:string;
    readonly password:string
  }


  export  class responseDto<T>{
    success:boolean;
    message:string;
    data?: T;



  }
  