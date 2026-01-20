import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { Biometric } from './schemas/biometric.schema';
export declare class BiometricService {
    private readonly jwtService;
    private biometricModel;
    constructor(jwtService: JwtService, biometricModel: Model<Biometric>);
    validateFacialBiometric(data: {
        cedula: string;
        imagenFacial: string;
    }): Promise<{
        success: boolean;
        message: string;
        confidence: number;
        token: string;
        expiresIn: string;
    }>;
    private generateAuthToken;
    healthCheck(): {
        status: string;
        service: string;
        imageComparison: string;
        timestamp: string;
    };
}
