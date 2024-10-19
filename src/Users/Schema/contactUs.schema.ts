import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the Contact interface extending Mongoose's Document
export type ContactDocument = ContactForm & Document;

@Schema({ timestamps: true })
export class ContactForm {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  message: string;
}

// Create a schema from the Contact class
export const ContactFormSchema = SchemaFactory.createForClass(ContactForm);
