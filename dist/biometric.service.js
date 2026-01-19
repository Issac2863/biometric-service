"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiometricService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const microservices_1 = require("@nestjs/microservices");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
        }
        else {
            console.warn(`[BIOMETRIC SERVICE] ⚠️ No hay registro biométrico (archivo .txt) para ${data.cedula}.`);
            console.log('Rutas buscadas:', possiblePaths);
        }
        console.log('[BIOMETRIC SERVICE] Analizando imagen...', `Tamaño: ${Math.round(data.imagenFacial.length / 1024)}KB`);
        await this.simulateProcessingTime();
        const confidence = hasReference ? 98 : this.generateConfidenceScore();
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