import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class BiometricService {
    constructor(private readonly jwtService: JwtService) { }

    /**
     * Validar biometría facial
     * MOCK: Simula la validación contra el Registro Civil
     * En producción, esto compararía la imagen con la base de datos biométrica
     */
    async validateFacialBiometric(data: { cedula: string; imagenFacial: string }) {
        console.log('[BIOMETRIC SERVICE] Validando biometría facial para:', data.cedula);

        // Verificar que hay una imagen
        if (!data.imagenFacial || data.imagenFacial.length < 100) {
            throw new RpcException({
                success: false,
                message: 'No se proporcionó una imagen facial válida',
                statusCode: 400
            });
        }

        // MOCK: Simular análisis de la imagen
        // En producción, aquí se enviaría la imagen al API del Registro Civil
        console.log('[BIOMETRIC SERVICE] Analizando imagen...',
            `Tamaño: ${Math.round(data.imagenFacial.length / 1024)}KB`);

        // Simular tiempo de procesamiento
        await this.simulateProcessingTime();

        // MOCK: Generar resultado aleatorio pero con alta probabilidad de éxito (95%)
        const confidence = this.generateConfidenceScore();
        const isMatch = confidence >= 75; // Umbral mínimo de 75%

        console.log(`[BIOMETRIC SERVICE] Resultado: ${isMatch ? 'MATCH' : 'NO MATCH'} (Confianza: ${confidence}%)`);

        if (!isMatch) {
            throw new RpcException({
                success: false,
                message: 'No se pudo verificar la identidad facial. Por favor intente nuevamente.',
                confidence,
                statusCode: 401
            });
        }

        // Generar JWT token para el usuario autenticado
        const token = await this.generateAuthToken(data.cedula);

        return {
            success: true,
            message: 'Biometría facial verificada correctamente',
            confidence,
            token,
            expiresIn: '1h'
        };
    }

    /**
     * Simular tiempo de procesamiento de IA
     */
    private async simulateProcessingTime(): Promise<void> {
        const delay = 500 + Math.random() * 1000; // 500-1500ms
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Generar score de confianza simulado
     * 95% de las veces será >= 75 (éxito)
     */
    private generateConfidenceScore(): number {
        const random = Math.random();
        if (random < 0.95) {
            // 95% de probabilidad: score entre 75-99
            return Math.floor(75 + Math.random() * 24);
        } else {
            // 5% de probabilidad: score bajo (fallo)
            return Math.floor(50 + Math.random() * 24);
        }
    }

    /**
     * Generar JWT token de autenticación
     */
    private async generateAuthToken(cedula: string): Promise<string> {
        const payload = {
            sub: cedula,
            type: 'voter',
            authLevel: 'biometric',
            iat: Math.floor(Date.now() / 1000)
        };

        return this.jwtService.sign(payload);
    }

    /**
     * Health check
     */
    healthCheck() {
        return {
            status: 'ok',
            service: 'biometric-service',
            timestamp: new Date().toISOString()
        };
    }
}
