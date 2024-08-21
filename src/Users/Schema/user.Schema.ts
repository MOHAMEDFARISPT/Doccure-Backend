/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

@Schema({ timestamps: true }) 
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  refreshToken: string; 

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'MedicalRecord' })
  medicalRecords: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Appointment' })
  appointments: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Wallet' })
  wallet: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop()
  profileImage: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
