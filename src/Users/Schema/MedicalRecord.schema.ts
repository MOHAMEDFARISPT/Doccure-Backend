/* eslint-disable prettier/prettier */
import { Schema } from 'mongoose';

export const MedicalRecordSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Reference to Doctor
  records: [
    {
      diagnosis: { type: String, required: true },
      treatment: { type: String, required: true },
      medications: [{ type: String }], // Array of medications
      visitDate: { type: Date, default: Date.now },
      notes: { type: String }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

