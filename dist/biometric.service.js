"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiometricService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const microservices_1 = require("@nestjs/microservices");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const biometric_schema_1 = require("./schemas/biometric.schema");
const image_comparison_1 = require("./image-comparison");
let BiometricService = class BiometricService {
    jwtService;
    biometricModel;
    constructor(jwtService, biometricModel) {
        this.jwtService = jwtService;
        this.biometricModel = biometricModel;
    }
    async validateFacialBiometric(data) {
        console.log('[BIOMETRIC SERVICE] Validando biometría facial para:', data.cedula);
        if (!data.imagenFacial || data.imagenFacial.length < 100) {
            throw new microservices_1.RpcException({
                success: false,
                message: 'No se proporcionó una imagen facial válida',
                statusCode: 400
            });
        }
        let biometricRecord = null;
        try {
            biometricRecord = await this.biometricModel.findOne({ cedula: data.cedula }).exec();
            if (!biometricRecord) {
                console.warn(`[BIOMETRIC SERVICE] ⚠️ No hay registro biométrico en DB para ${data.cedula}.`);
                throw new microservices_1.RpcException({
                    success: false,
                    message: 'No existe registro biométrico para esta cédula. Contacte al administrador.',
                    statusCode: 404
                });
            }
            console.log(`[BIOMETRIC SERVICE] ✅ Foto de referencia encontrada en MongoDB para ${data.cedula}`);
        }
        catch (error) {
            if (error instanceof microservices_1.RpcException)
                throw error;
            console.error('[BIOMETRIC SERVICE] Error consultando MongoDB:', error);
            throw new microservices_1.RpcException({
                success: false,
                message: 'Error consultando base de datos biométrica',
                statusCode: 500
            });
        }
        console.log('[BIOMETRIC SERVICE] 🔍 Iniciando comparación de imágenes...', `Tamaño imagen capturada: ${Math.round(data.imagenFacial.length / 1024)}KB`);
        try {
            const result = await (0, image_comparison_1.compareImages)(data.imagenFacial, biometricRecord.imagenBase64);
            console.log(`[BIOMETRIC SERVICE] Resultado comparación: Similitud ${result.similarity}%, Match: ${result.isMatch}`);
            if (!result.isMatch) {
                console.warn(`[BIOMETRIC SERVICE] ❌ Imágenes NO coinciden para ${data.cedula}`);
                throw new microservices_1.RpcException({
                    success: false,
                    message: 'La verificación facial falló. La imagen no coincide con el registro.',
                    confidence: result.similarity,
                    statusCode: 401
                });
            }
            console.log(`[BIOMETRIC SERVICE] ✅ MATCH EXITOSO para ${data.cedula} (${result.similarity}%)`);
            const token = await this.generateAuthToken(data.cedula);
            return {
                success: true,
                message: 'Biometría facial verificada correctamente',
                confidence: result.similarity,
                token,
                expiresIn: '1h'
            };
        }
        catch (error) {
            if (error instanceof microservices_1.RpcException)
                throw error;
            console.error('[BIOMETRIC SERVICE] Error en comparación:', error.message);
            throw new microservices_1.RpcException({
                success: false,
                message: 'Error al procesar la verificación facial. Intente nuevamente.',
                statusCode: 500
            });
        }
    }
    async generateAuthToken(cedula) {
        const payload = {
            sub: cedula,
            type: 'voter',
            authLevel: 'biometric',
            iat: Math.floor(Date.now() / 1000)
        };
        return this.jwtService.sign(payload);
    }
    healthCheck() {
        return {
            status: 'ok',
            service: 'biometric-service',
            imageComparison: 'enabled',
            timestamp: new Date().toISOString()
        };
    }
};
exports.BiometricService = BiometricService;
exports.BiometricService = BiometricService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(biometric_schema_1.Biometric.name)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        mongoose_2.Model])
], BiometricService);
//# sourceMappingURL=biometric.service.js.map