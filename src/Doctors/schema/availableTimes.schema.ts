/* eslint-disable prettier/prettier */
// available-time.schema.ts
import { Schema, Types, model } from 'mongoose';


export const availableTimeSchema = new Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isBooked:{type:Boolean,default:false},
  doctorId: { type: Types.ObjectId, ref: 'Doctor', required: true },
});

export const AvailableTimeSchema = model('AvailableTime', availableTimeSchema);

