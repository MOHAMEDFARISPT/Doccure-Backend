/* eslint-disable prettier/prettier */
import { Schema } from 'mongoose';
export enum Gender{
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"

}

export const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type:String,enum:Gender,required: false },
  dateOfBirth: { type: Date, required: false },
  contactNumber: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  PatientId:{type:String,required:false},
  isOtpVerified:{type:Boolean},
  isBlocked:{type:Boolean,default:false},
  role:{type:String},
  profileImage: { type: String,default:''},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isGoogle:{type:Boolean,default:false}
});




export const TemporaryUser=new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type:String,enum:Gender,required: true },
  dateOfBirth: { type: Date, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp:{type:String,required:true},
  otpExpires:{type:Date},
  isOtpVerified:{type:Boolean},
  isGoogle:{type:Boolean,default:false}
  



})








