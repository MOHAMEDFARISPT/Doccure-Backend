/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";





@Schema({timestamps:true})
export class Appointments extends Document{


    @Prop({type:MongooseSchema.Types.ObjectId,ref:'User'})
    patientId:MongooseSchema.Types.ObjectId;

    @Prop({type:MongooseSchema.Types.ObjectId,ref:'Doctor'})
    DoctorId:MongooseSchema.Types.ObjectId;

    @Prop()
    AppointmentDate:Date
    
    @Prop()
    AppointmentTime:Date


    @Prop({ required: false })
    symptoms: string;

  
    @Prop({default:'Compleated'})          /* (Scheduled, Completed, Canceled)*/
    status:string

    @Prop({default:'DirectConsultation'})
    consultationType:string

    @Prop()
    Reasonforcancellation:string


    @Prop({type:MongooseSchema.Types.ObjectId,ref:'Precription'})
    Prescription:MongooseSchema.Types.ObjectId;






    
}

export const AppointmentSchema=SchemaFactory.createForClass(Appointments)