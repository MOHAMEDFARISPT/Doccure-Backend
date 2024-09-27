/* eslint-disable prettier/prettier */
// appointment.model.ts
import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the Appointment document
export interface Appointment extends Document {
  patientId: mongoose.Schema.Types.ObjectId; 
  doctorId: mongoose.Schema.Types.ObjectId;
  slotId: mongoose.Schema.Types.ObjectId;
  totalAmount: number;
  PaymentMethod: string;
  paymentStatus: string;
  consultationType: string;
  consultaionStatus:string;
  isCancelled: boolean; 
  cancellationReason?: string; 
}

// Create the Appointment schema
export const AppointmentSchema = new Schema<Appointment>({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Doctor',
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'availableTimes',
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  PaymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['paid', 'unpaid'],
  },
  consultationType: {
    type: String,
    required: true,
    enum: ['chatConsultation', 'vedioCall', 'directVisit'],
  },
  consultaionStatus:{
    type:String,
    default:'upcoming',
     enum:['upcoming','cancelled','compleated']

  },
  isCancelled: {
    type: Boolean,
    default: false, 
  },
  cancellationReason: {
    type: String,
    required: false, 
  },
});

// Export the model and the interface
export const AppointmentModel = mongoose.model<Appointment>('Appointment', AppointmentSchema);
