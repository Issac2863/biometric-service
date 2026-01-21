# Biometric Service - SEVoTec

> **Microservicio de Verificación Biométrica Facial**  
> Sistema de Votación Electrónica Segura

---

## Descripción General

Servicio de verificación biométrica facial que compara imágenes capturadas contra registros almacenados en MongoDB Atlas, utilizando análisis de píxeles con la librería **Jimp**.

---

## Arquitectura

```
biometric-service/
├── src/
│   ├── biometric.controller.ts   # Endpoints RPC
│   ├── biometric.service.ts      # Lógica de verificación
│   ├── image-comparison.ts       # Algoritmo de comparación
│   ├── dto/
│   │   └── biometric.dto.ts      # DTOs de validación
│   └── schemas/
│       └── biometric.schema.ts   # Schema MongoDB
├── models/                        # Imágenes de referencia
├── Dockerfile
└── package.json
```

---

## Endpoints (Message Patterns)

### `biometric.validate-facial`
**Objetivo:** Comparar imagen facial capturada contra el registro biométrico almacenado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cedula` | `string` | Número de cédula del ciudadano |
| `imagenFacial` | `string` | Imagen capturada en Base64 |

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Biometría facial verificada correctamente",
  "confidence": 92,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "1h"
}
```

---

### `biometric.health`
**Objetivo:** Verificar estado del servicio.

**Respuesta:**
```json
{
  "status": "ok",
  "service": "biometric-service",
  "imageComparison": "enabled",
  "timestamp": "2026-01-21T12:00:00.000Z"
}
```

---

## Componentes de Seguridad

### 1. Validación de Imagen de Entrada

**Archivo:** `src/biometric.service.ts` - Método `validateFacialBiometric()`

**Objetivo:** Verificar que la imagen proporcionada sea válida antes de procesarla.

**Operación:**
```typescript
if (!data.imagenFacial || data.imagenFacial.length < 100) {
    throw new RpcException({
        success: false,
        message: 'No se proporcionó una imagen facial válida',
        statusCode: 400
    });
}
```

**Validaciones:**
| Check | Criterio | Acción si falla |
|-------|----------|-----------------|
| Existencia | `imagenFacial` definida | Error 400 |
| Tamaño mínimo | ≥ 100 caracteres | Error 400 |

---

### 2. Algoritmo de Comparación de Imágenes

**Archivo:** `src/image-comparison.ts`

**Función:** `compareImages(capturedImageBase64, referenceImageBase64)`

**Objetivo:** Determinar si dos imágenes faciales corresponden a la misma persona mediante análisis de píxeles.

**Parámetros:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `capturedImageBase64` | `string` | Imagen capturada (puede incluir prefijo data:image) |
| `referenceImageBase64` | `string` | Imagen de referencia de la base de datos |

**Operación:**
```
1. Preprocesamiento:
   ├── Eliminar prefijo "data:image/xxx;base64," si existe
   ├── Decodificar Base64 a Buffer
   └── Cargar imágenes con Jimp

2. Normalización:
   ├── Redimensionar ambas a 100x100 píxeles
   └── Convertir a escala de grises

3. Comparación píxel a píxel:
   ├── Iterar cada píxel (x, y)
   ├── Extraer componente rojo (en grises todos son iguales)
   └── Sumar diferencias absolutas |R1 - R2|

4. Cálculo de similitud:
   ├── Diferencia promedio = totalDiff / 10000
   ├── Porcentaje diferencia = avgDiff / 255
   └── Similitud = (1 - diferencia) * 100
```

**Retorno:**
```typescript
{
  isMatch: boolean,     // true si similitud >= 85%
  similarity: number,   // 0-100
  message: string       // Descripción del resultado
}
```

**Configuración:**
| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Tamaño normalizado | 100×100 px | Reduce ruido y optimiza comparación |
| Formato color | Escala de grises | Elimina variaciones de iluminación |
| Umbral de match | 85% | Similitud mínima requerida |

---

### 3. Modo Demo (Fallback sin Registro)

**Archivo:** `src/biometric.service.ts`

**Objetivo:** Permitir pruebas cuando no existe registro biométrico en MongoDB.

**Operación:**
```typescript
if (!biometricRecord) {
    console.warn('No hay registro biométrico en DB');
    console.log('MODO DEMO: Usando imagen entrante como referencia');
    
    biometricRecord = {
        cedula: data.cedula,
        imagenBase64: data.imagenFacial  // Auto-match
    };
}
```

**Comportamiento:**
- Si no existe registro → usa misma imagen como referencia
- Resultado: siempre 100% de similitud (auto-match)
- **Solo para desarrollo/demos**

---

### 4. Generación de Token JWT

**Archivo:** `src/biometric.service.ts` - Método `generateAuthToken()`

**Objetivo:** Generar token de sesión tras verificación biométrica exitosa.

**Parámetros:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `cedula` | `string` | Identificador del ciudadano verificado |

**Operación:**
```typescript
const payload = {
    sub: cedula,           // Subject: cédula
    type: 'voter',         // Tipo de usuario
    authLevel: 'biometric',// Nivel de autenticación
    iat: Math.floor(Date.now() / 1000)
};

return this.jwtService.sign(payload);
```

**Claims del token:**
| Claim | Valor | Descripción |
|-------|-------|-------------|
| `sub` | Cédula | Identificador único |
| `type` | `"voter"` | Tipo de entidad |
| `authLevel` | `"biometric"` | Método de autenticación |
| `iat` | Timestamp | Momento de emisión |

---

## Schema de Base de Datos

**Archivo:** `src/schemas/biometric.schema.ts`

```typescript
@Schema({ collection: 'biometrics', timestamps: true })
export class Biometric extends Document {
    @Prop({ required: true, unique: true, index: true })
    cedula: string;

    @Prop({ required: true })
    imagenBase64: string;
}
```

**Campos:**
| Campo | Tipo | Índice | Descripción |
|-------|------|--------|-------------|
| `cedula` | `string` | Único | Identificador del ciudadano |
| `imagenBase64` | `string` | No | Imagen facial de referencia |
| `createdAt` | `Date` | No | Fecha de creación (auto) |
| `updatedAt` | `Date` | No | Última actualización (auto) |

---

## Variables de Entorno

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/sevotec

# JWT
JWT_SECRET=<secreto para tokens>

# Puerto TCP
BIOMETRIC_SERVICE_PORT=3002
```

---

## Dependencias Clave

| Paquete | Versión | Uso |
|---------|---------|-----|
| `jimp` | 1.x | Procesamiento de imágenes |
| `mongoose` | 8.x | ODM para MongoDB |
| `@nestjs/jwt` | 10.x | Generación de tokens |

---

## Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Docker
docker build -t biometric-service .
docker run -p 3002:3002 biometric-service
```

---

## Scripts Útiles

### Actualizar foto de referencia
```bash
node scripts/update-photo.js <cedula> <ruta-imagen>
```

---

## Diagrama de Flujo

```
┌──────────────┐     ┌─────────────────┐     ┌─────────────┐
│ Auth Service │────▶│ Biometric Svc   │────▶│ MongoDB     │
│              │     │                 │     │ (biometrics)│
│ cedula +     │     │ 1. Buscar ref   │     │             │
│ imagenBase64 │     │ 2. Comparar     │     │ cedula      │
│              │     │ 3. Generar JWT  │     │ imagenBase64│
└──────────────┘     └─────────────────┘     └─────────────┘
```
