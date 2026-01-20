const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuración
const MONGO_URI = "mongodb+srv://sevotec-prod:CPBrHBzLfwFyPZZ2@sevotec.upcglbc.mongodb.net/?appName=SEVOTEC";
const CEDULA = "1500958069";
// Ruta absoluta proporcionada
const IMAGE_PATH = String.raw`C:\Users\Issac\Desktop\ISSAC - SLB\issac de la cadena.jpg`;

// Schema simple
const BiometricSchema = new mongoose.Schema({
    cedula: { type: String, required: true, unique: true },
    imagenBase64: { type: String, required: true },
}, { collection: 'biometrics' });

const BiometricModel = mongoose.model('Biometric', BiometricSchema);

async function updatePhoto() {
    try {
        console.log('🔄 Conectando a MongoDB Atlas...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conexión exitosa.');

        if (!fs.existsSync(IMAGE_PATH)) {
            console.error(`❌ Error: No se encontró el archivo en: ${IMAGE_PATH}`);
            process.exit(1);
        }

        console.log(`📖 Leyendo imagen: ${IMAGE_PATH}...`);
        const imgBuffer = fs.readFileSync(IMAGE_PATH);

        // Detectar extensión
        const ext = path.extname(IMAGE_PATH).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
        const base64Image = `data:${mime};base64,${imgBuffer.toString('base64')}`;

        console.log('📤 Subiendo a MongoDB...');
        const result = await BiometricModel.updateOne(
            { cedula: CEDULA },
            {
                cedula: CEDULA,
                imagenBase64: base64Image
            },
            { upsert: true } // Crear si no existe
        );

        console.log('✅ Operación completada:');
        console.log(result);
        console.log(`\n🎉 La foto ha sido subida correctamente.`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado.');
    }
}

updatePhoto();
