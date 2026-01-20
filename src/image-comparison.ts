const { Jimp } = require('jimp');

/**
 * Comparar dos imágenes usando Jimp v1.x
 * Compara píxeles después de normalizar tamaño y convertir a escala de grises
 */
export async function compareImages(
    capturedImageBase64: string,
    referenceImageBase64: string
): Promise<{
    isMatch: boolean;
    similarity: number;
    message: string;
}> {
    try {
        // Eliminar prefijo data:image si existe
        const capturedData = capturedImageBase64.replace(/^data:image\/\w+;base64,/, '');
        const referenceData = referenceImageBase64.replace(/^data:image\/\w+;base64,/, '');

        // Cargar imágenes desde Base64
        const capturedBuffer = Buffer.from(capturedData, 'base64');
        const referenceBuffer = Buffer.from(referenceData, 'base64');

        const capturedImage = await Jimp.read(capturedBuffer);
        const referenceImage = await Jimp.read(referenceBuffer);

        // Normalizar: redimensionar ambas a 100x100 y convertir a escala de grises
        const size = 100;
        capturedImage.resize({ w: size, h: size }).greyscale();
        referenceImage.resize({ w: size, h: size }).greyscale();

        // Calcular diferencia de píxeles manualmente
        let totalDiff = 0;
        const totalPixels = size * size;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const c1 = capturedImage.getPixelColor(x, y);
                const c2 = referenceImage.getPixelColor(x, y);

                // Extraer componente rojo (en escala de grises todos son iguales)
                const r1 = (c1 >> 24) & 0xFF;
                const r2 = (c2 >> 24) & 0xFF;

                totalDiff += Math.abs(r1 - r2);
            }
        }

        // Calcular diferencia promedio (0-255) y convertir a porcentaje
        const avgDiff = totalDiff / totalPixels;
        const differencePercent = avgDiff / 255;
        const similarity = Math.round((1 - differencePercent) * 100);

        // Umbral: si la similitud es mayor al 85%, consideramos match
        const threshold = 85;
        const isMatch = similarity >= threshold;

        console.log(`[IMAGE COMPARE] Diferencia promedio: ${avgDiff.toFixed(2)}, Similitud: ${similarity}%`);

        return {
            isMatch,
            similarity,
            message: isMatch
                ? `Imágenes coinciden (${similarity}% similitud)`
                : `Imágenes no coinciden (${similarity}% similitud, mínimo requerido: ${threshold}%)`
        };

    } catch (error: any) {
        console.error('[IMAGE COMPARE] Error comparando imágenes:', error.message);
        return {
            isMatch: false,
            similarity: 0,
            message: `Error procesando imágenes: ${error.message}`
        };
    }
}
