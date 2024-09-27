/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema({ timestamps: true })
export class Wallet extends Document {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  balance: number;

  @Prop({
    type: [
      {
        transactionId: { type: MongooseSchema.Types.ObjectId, auto: true },  // Auto-generating transactionId
        amount: { type: Number, required: true },
        type: { type: String, enum: ['Debit', 'Credit'], required: true },   // Enum for type validation
        description: { type: String },
        appointmentId: { type: MongooseSchema.Types.ObjectId, ref: 'Appointment', required: true }, // New field for appointmentId
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  transactions: {
    transactionId: MongooseSchema.Types.ObjectId;
    amount: number;
    type: 'Debit' | 'Credit';  // Limited to Debit or Credit
    description?: string;
    appointmentId: MongooseSchema.Types.ObjectId;  
    createdAt?: Date;
    updatedAt?: Date;
  }[];

  // Add createdAt and updatedAt fields for the wallet itself
  createdAt?: Date;
  updatedAt?: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
