import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BiometricController } from './biometric.controller';
import { BiometricService } from './biometric.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sevotec-jwt-secret-key-2026',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [BiometricController],
  providers: [BiometricService],
})
export class AppModule { }
