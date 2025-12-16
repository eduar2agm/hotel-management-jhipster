import { TipoIdentificacion } from '../types/enums';
export { TipoIdentificacion };

// Removed duplicate enum definition


export const IDENTIFICATION_TYPES = [
    { value: TipoIdentificacion.CEDULA, label: 'Cédula de Identidad (Nacionales)' },
    { value: TipoIdentificacion.PASAPORTE, label: 'Pasaporte (Nicaragüense)' },
    { value: TipoIdentificacion.CEDULA_RESIDENCIA, label: 'Cédula de Residencia' },
    { value: TipoIdentificacion.PASAPORTE_EXT, label: 'Pasaporte Extranjero' },
    { value: TipoIdentificacion.RUC, label: 'RUC (Jurídico)' },
    { value: TipoIdentificacion.INSS, label: 'Número INSS' }
];

export const VALIDATION_RULES: Record<TipoIdentificacion, { regex: RegExp; error: string }> = {
    [TipoIdentificacion.CEDULA]: {
        regex: /^[0-9]{3}-[0-9]{6}-[0-9]{4}[A-Za-z]$/,
        error: 'Formato inválido: XXX-DDMMAA-####L (16 caracteres)'
    },
    [TipoIdentificacion.PASAPORTE]: {
        regex: /^[A-Za-z][0-9]{8}$/,
        error: 'Formato inválido: Letra + 8 dígitos (9 caracteres)'
    },
    [TipoIdentificacion.CEDULA_RESIDENCIA]: {
        regex: /^[0-9]{8}$/,
        error: 'Formato inválido: 8 dígitos numéricos'
    },
    [TipoIdentificacion.INSS]: {
        regex: /^[0-9]{7}-[0-9]$/,
        error: 'Formato inválido: 7 dígitos + guion + 1 dígito (#######-#)'
    },
    [TipoIdentificacion.RUC]: {
        regex: /^J[0-9]{13}$/,
        error: 'Formato inválido: "J" + 13 dígitos numéricos'
    },
    [TipoIdentificacion.PASAPORTE_EXT]: {
        regex: /^[A-Za-z0-9]{6,15}$/,
        error: 'Formato inválido: 6 a 15 caracteres alfanuméricos'
    },
    [TipoIdentificacion.DNI]: {
        regex: /.+/,
        error: 'Campo requerido'
    }
};

export const IDENTIFICATION_PLACEHOLDERS: Record<TipoIdentificacion, string> = {
    [TipoIdentificacion.CEDULA]: '001-010190-0000A',
    [TipoIdentificacion.PASAPORTE]: 'A00000000',
    [TipoIdentificacion.CEDULA_RESIDENCIA]: '00000000',
    [TipoIdentificacion.INSS]: '1234567-8',
    [TipoIdentificacion.RUC]: 'J0000000000000',
    [TipoIdentificacion.PASAPORTE_EXT]: 'A123456789',
    [TipoIdentificacion.DNI]: ''
};

export const validateIdentification = (type: string, value: string): string | null => {
    const rule = VALIDATION_RULES[type as TipoIdentificacion];
    if (!rule) return null;
    if (!rule.regex.test(value)) {
        return rule.error;
    }
    return null;
};

export const formatIdentification = (type: string, value: string): string => {
    // Remove non-alphanumeric just in case, but keep hyphens if user typed them to re-process
    let clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    switch (type) {
        case TipoIdentificacion.CEDULA:
            // Format: XXX-DDMMAA-####L
            if (clean.length > 14) {
                // Full length with letter: 3 + 6 + 4 + 1 = 14 chars payload
                clean = clean.substring(0, 14);
            }

            if (clean.length > 9) {
                return `${clean.substring(0, 3)}-${clean.substring(3, 9)}-${clean.substring(9)}`;
            } else if (clean.length > 3) {
                return `${clean.substring(0, 3)}-${clean.substring(3)}`;
            }
            return clean;

        case TipoIdentificacion.INSS:
            // Format: #######-#
            if (clean.length > 8) {
                // 7 + 1 = 8 chars
                clean = clean.substring(0, 8);
            }

            if (clean.length > 7) {
                return `${clean.substring(0, 7)}-${clean.substring(7)}`;
            }
            return clean;

        case TipoIdentificacion.RUC:
            // Format: J#############
            if (!clean.startsWith('J')) {
                if (clean.length > 0 && /^\d/.test(clean)) {
                    // If user started typing numbers, prepend J
                    clean = 'J' + clean;
                }
            }
            if (clean.length > 14) clean = clean.substring(0, 14);
            return clean;

        case TipoIdentificacion.PASAPORTE:
            if (clean.length > 9) clean = clean.substring(0, 9);
            return clean;

        case TipoIdentificacion.CEDULA_RESIDENCIA:
            // Digits only
            clean = clean.replace(/[^0-9]/g, '');
            if (clean.length > 8) clean = clean.substring(0, 8);
            return clean;

        default:
            return value;
    }
};
