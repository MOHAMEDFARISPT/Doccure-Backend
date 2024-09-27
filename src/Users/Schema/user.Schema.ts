/* eslint-disable prettier/prettier */
import { Schema, Document, model } from 'mongoose';

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

// Define the interface for the User document
export interface UserModel extends Document {
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth?: Date;
  contactNumber?: string;
  email: string;
  password?: string;
  PatientId?: string;
  isOtpVerified?: boolean;
  isBlocked?: boolean;
  role?: string;
  profileImage?: string;
  isGoogle?: boolean;
}

// Create the User schema
export const UserSchema = new Schema<UserModel>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: Object.values(Gender), required: false }, // Use Object.values to get enum values
  dateOfBirth: { type: Date, required: false },
  contactNumber: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  PatientId: { type: String, required: false },
  isOtpVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  role: { type: String, default: 'patient' }, 
  profileImage: { type: String, default: '' },
  isGoogle: { type: Boolean, default: false },
}, { timestamps: true }); // Enable timestamps for createdAt and updatedAt

// Export the model
export const UserModel = model<UserModel>('User', UserSchema);



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








