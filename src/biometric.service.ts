import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Biometric } from './schemas/biometric.schema';
import { compareImages } from './image-comparison';

@Injectable()
export class BiometricService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectModel(Biometric.name) private biometricModel: Model<Biometric>
    ) { }

    /**
     * Validar biometría facial con COMPARACIÓN DE IMÁGENES
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

        // Buscar foto de referencia en MongoDB
        let biometricRecord: any = null;
        try {
            biometricRecord = await this.biometricModel.findOne({ cedula: data.cedula }).exec();

            if (!biometricRecord) {
                console.warn(`[BIOMETRIC SERVICE] ⚠️ No hay registro biométrico en DB para ${data.cedula}.`);
                throw new RpcException({
                    success: false,
                    message: 'No existe registro biométrico para esta cédula. Contacte al administrador.',
                    statusCode: 404
                });
            }

            console.log(`[BIOMETRIC SERVICE] ✅ Foto de referencia encontrada en MongoDB para ${data.cedula}`);
        } catch (error) {
            if (error instanceof RpcException) throw error;
            console.error('[BIOMETRIC SERVICE] Error consultando MongoDB:', error);
            throw new RpcException({
                success: false,
                message: 'Error consultando base de datos biométrica',
                statusCode: 500
            });
        }

        console.log('[BIOMETRIC SERVICE] 🔍 Iniciando comparación de imágenes...',
            `Tamaño imagen capturada: ${Math.round(data.imagenFacial.length / 1024)}KB`);

        // COMPARACIÓN DE IMÁGENES
        try {
            const result = await compareImages(
                data.imagenFacial,
                biometricRecord.imagenBase64
            );

            console.log(`[BIOMETRIC SERVICE] Resultado comparación: Similitud ${result.similarity}%, Match: ${result.isMatch}`);

            // Si las imágenes no coinciden
            if (!result.isMatch) {
                console.warn(`[BIOMETRIC SERVICE] ❌ Imágenes NO coinciden para ${data.cedula}`);
                throw new RpcException({
                    success: false,
                    message: 'La verificación facial falló. La imagen no coincide con el registro.',
                    confidence: result.similarity,
                    statusCode: 401
                });
            }

            console.log(`[BIOMETRIC SERVICE] ✅ MATCH EXITOSO para ${data.cedula} (${result.similarity}%)`);

            // Generar JWT token para el usuario autenticado
            const token = await this.generateAuthToken(data.cedula);

            return {
                success: true,
                message: 'Biometría facial verificada correctamente',
                confidence: result.similarity,
                token,
                expiresIn: '1h'
            };

        } catch (error) {
            if (error instanceof RpcException) throw error;

            console.error('[BIOMETRIC SERVICE] Error en comparación:', error.message);
            throw new RpcException({
                success: false,
                message: 'Error al procesar la verificación facial. Intente nuevamente.',
                statusCode: 500
            });
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
            imageComparison: 'enabled',
            timestamp: new Date().toISOString()
        };
    }
}
