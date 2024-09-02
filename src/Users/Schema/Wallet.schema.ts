/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document,Schema as MongooseSchema } from "mongoose";




@Schema({timestamps:true})

export class Wallet extends Document{

    @Prop({type:MongooseSchema.Types.ObjectId,ref:'User'})
    PatientId:MongooseSchema.Types.ObjectId


    @Prop({default:0})
    Balance:number

    @Prop({
        type: [
          {
            transactionId: { type: MongooseSchema.Types.ObjectId, required: true }, 
            amount: { type: Number, required: true }, 
            type: { type: String, required: true },
            date: { type: Date, required: true },
            description: { type: String }, 
          },
        ],
        default: [], 
      })
      transactions: {
        transactionId: MongooseSchema.Types.ObjectId;
        amount: number;
        type: string;
        date: Date;
        description?: string;
      }[];


      @Prop({ required: true, default: 'INR' })
      currency: string;
    


}

export const walletSchema=SchemaFactory.createForClass(Wallet)