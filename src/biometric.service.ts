import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BiometricService {
    constructor(private readonly jwtService: JwtService) { }

    /**
     * Validar biometría facial
     * MOCK (Fallback): Usa sistema de archivos local por bloqueo de red en MongoDB
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

        // Buscar foto de referencia (MOCK FILESYSTEM)
        // Usamos esto porque la red bloquea Mongo Atlas (Puerto 27017) con ETIMEDOUT
        const projectRoot = process.cwd();
        const possiblePaths = [
            path.join(projectRoot, 'src', 'mock-db', 'faces', `${data.cedula}.txt`),
            path.join(projectRoot, 'dist', 'mock-db', 'faces', `${data.cedula}.txt`),
            path.join(projectRoot, 'mock-db', 'faces', `${data.cedula}.txt`)
        ];

        let foundPath = '';
        let hasReference = false;

        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                foundPath = p;
                hasReference = true;
                break;
            }
        }

        if (hasReference) {
            console.log(`[BIOMETRIC SERVICE] ✅ Foto de referencia encontrada en Archivo Local: ${foundPath}`);
        } else {
            console.warn(`[BIOMETRIC SERVICE] ⚠️ No hay registro biométrico (archivo .txt) para ${data.cedula}.`);
            console.log('Rutas buscadas:', possiblePaths);
        }

        console.log('[BIOMETRIC SERVICE] Analizando imagen...',
            `Tamaño: ${Math.round(data.imagenFacial.length / 1024)}KB`);

        // Simular tiempo de procesamiento
        await this.simulateProcessingTime();

        // Si tenemos referencia, el match es seguro (98%)
        const confidence = hasReference ? 98 : this.generateConfidenceScore();
        const isMatch = confidence >= 75;

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
