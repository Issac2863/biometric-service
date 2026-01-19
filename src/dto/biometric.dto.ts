import { IsNotEmpty, IsString, Length, Matches, MaxLength } from 'class-validator';

export class ValidateBiometricDto {
    @IsNotEmpty({ message: 'La cédula es obligatoria' })
    @IsString()
    @Length(10, 10, { message: 'La cédula debe tener exactamente 10 dígitos' })
    @Matches(/^[0-9]+$/, { message: 'La cédula debe contener solo números' })
    cedula: string;

    @IsNotEmpty({ message: 'La imagen facial es obligatoria' })
    @IsString()
    // Limitar tamaño de string base64 (ej. 5MB ~= 7M caracteres) para evitar Memory Exhaustion
    @MaxLength(10 * 1024 * 1024, { message: 'La imagen es demasiado grande' })
    imagenFacial: string;
}
