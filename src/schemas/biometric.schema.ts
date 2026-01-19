import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'biometrics', timestamps: true })
export class Biometric extends Document {
    @Prop({ required: true, unique: true, index: true })
    cedula: string;

    @Prop({ required: true })
    imagenBase64: string;
}

export const BiometricSchema = SchemaFactory.createForClass(Biometric);
