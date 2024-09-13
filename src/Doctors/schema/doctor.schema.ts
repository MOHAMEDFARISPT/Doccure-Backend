/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */
import { Schema, Document, model } from 'mongoose';

// Define the interface for the doctor document
export interface DoctorModel extends Document {
    personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    contactNumber: string;
    dateofBirth: Date;
    password: string;
    isApproved:Boolean;
    profileImage:string;
    isBlocked:Boolean;
    role:string;
  };
  generalDetails: {
    city: string;
    state: string;
    country: string;
    zipcode: string;
    adharNumber: string;
  };
  professionalDetails: {
    medicalLicenceNumber: string;
    specialisedDepartment:string;
    bio:string;
    totalExperience: number;
    patientsPerDay: number;
    consultationFee: number;
  }
}

// Define the schema
export const DoctorSchema = new Schema({
  personalDetails: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, required: true },
    contactNumber: { type: String, required: true },
    dateofBirth: { type: Date, required: true },
    password: { type: String, required: true },
    isApproved:{type:Boolean,default:false},
    profileImage:{type:String,default:''},
    isBlocked:{type:Boolean,default:false},
    role:{type:String,default:false}
  },
  generalDetails: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipcode: { type: String, required: true },
    adharNumber: { type: String, required: true }
  },
  professionalDetails: {
    medicalLicenceNumber: { type: String, required: true },
    bio:{type:String,required:true},
    specialisedDepartment:{type:String,required:true},
    totalExperience: { type: Number, required: true },
    patientsPerDay: { type: Number, required: true },
    consultationFee: { type: Number, required: true }
  }
}, { timestamps: true });


export const DoctorModel = model<DoctorModel>('Doctor', DoctorSchema);