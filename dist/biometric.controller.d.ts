import { BiometricService } from './biometric.service';
export declare class BiometricController {
    private readonly biometricService;
    constructor(biometricService: BiometricService);
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
    healthCheck(): {
        status: string;
        service: string;
        timestamp: string;
    };
}
