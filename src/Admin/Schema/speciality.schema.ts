import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type specialityDocument = speciality & Document;
@Schema({ timestamps: true })
export class speciality {
  @Prop({ required: true })
  specialityName: string;

  @Prop({ required: true })
  specialityDescription: string;

  @Prop({ default: false })
  isListed: boolean;
}
export const specialityScheama = SchemaFactory.createForClass(speciality);
