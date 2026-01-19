import { JwtService } from '@nestjs/jwt';
export declare class BiometricService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
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
    private simulateProcessingTime;
    private generateConfidenceScore;
    private generateAuthToken;
    healthCheck(): {
        status: string;
        service: string;
        timestamp: string;
    };
}
