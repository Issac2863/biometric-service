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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiometricService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const microservices_1 = require("@nestjs/microservices");
let BiometricService = class BiometricService {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
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
        console.log('[BIOMETRIC SERVICE] Analizando imagen...', `Tamaño: ${Math.round(data.imagenFacial.length / 1024)}KB`);
        await this.simulateProcessingTime();
        const confidence = this.generateConfidenceScore();
        const isMatch = confidence >= 75;
        console.log(`[BIOMETRIC SERVICE] Resultado: ${isMatch ? 'MATCH' : 'NO MATCH'} (Confianza: ${confidence}%)`);
        if (!isMatch) {
            throw new microservices_1.RpcException({
                success: false,
                message: 'No se pudo verificar la identidad facial. Por favor intente nuevamente.',
                confidence,
                statusCode: 401
            });
        }
        const token = await this.generateAuthToken(data.cedula);
        return {
            success: true,
            message: 'Biometría facial verificada correctamente',
            confidence,
            token,
            expiresIn: '1h'
        };
    }
    async simulateProcessingTime() {
        const delay = 500 + Math.random() * 1000;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    generateConfidenceScore() {
        const random = Math.random();
        if (random < 0.95) {
            return Math.floor(75 + Math.random() * 24);
        }
        else {
            return Math.floor(50 + Math.random() * 24);
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
            timestamp: new Date().toISOString()
        };
    }
};
exports.BiometricService = BiometricService;
exports.BiometricService = BiometricService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], BiometricService);
//# sourceMappingURL=biometric.service.js.map