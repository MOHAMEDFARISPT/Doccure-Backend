import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Wallet extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Use 'Types.ObjectId' for better typing compatibility

  @Prop({ default: 0 })
  balance: number;

  @Prop({
    type: [
      {
        transactionId: {
          type: MongooseSchema.Types.ObjectId,
          default: new Types.ObjectId(),
        },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['Debit', 'Credit'], required: true },
        description: { type: String },
        appointmentId: {
          type: MongooseSchema.Types.ObjectId,
          ref: 'Appointment',
          required: true,
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  transactions: {
    transactionId: Types.ObjectId;
    amount: number;
    type: 'Debit' | 'Credit'; // Enforced as an enum type
    description?: string;
    appointmentId: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  }[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
