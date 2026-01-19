import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BiometricService } from './biometric.service';

@Controller()
export class BiometricController {
    constructor(private readonly biometricService: BiometricService) { }

    /**
     * Validar biometría facial
     * Pattern: biometric.validate-facial
     */
    @MessagePattern('biometric.validate-facial')
    async validateFacialBiometric(@Payload() data: { cedula: string; imagenFacial: string }) {
        console.log('[BIOMETRIC CONTROLLER] Mensaje recibido: biometric.validate-facial');
        return this.biometricService.validateFacialBiometric(data);
    }

    /**
     * Health check
     * Pattern: biometric.health
     */
    @MessagePattern('biometric.health')
    healthCheck() {
        return this.biometricService.healthCheck();
    }
}
