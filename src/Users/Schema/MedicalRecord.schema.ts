/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema({ timestamps: true }) 
export class MedicalRecord extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true }) // Reference to User (patient)
  patientId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  recordType: string;

  @Prop({ required: true })
  description: string;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);
