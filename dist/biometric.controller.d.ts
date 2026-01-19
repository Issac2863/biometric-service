import { BiometricService } from './biometric.service';
import { ValidateBiometricDto } from './dto/biometric.dto';
export declare class BiometricController {
    private readonly biometricService;
    constructor(biometricService: BiometricService);
    validateFacialBiometric(data: ValidateBiometricDto): Promise<{
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
