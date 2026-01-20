import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { BiometricController } from './biometric.controller';
import { BiometricService } from './biometric.service';
import { Biometric, BiometricSchema } from './schemas/biometric.schema';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/sevotec'),
    MongooseModule.forFeature([{ name: Biometric.name, schema: BiometricSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sevotec-jwt-secret-key-2026',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [BiometricController],
  providers: [BiometricService],
})
export class AppModule { }
