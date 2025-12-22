export interface RedSocialDTO {
    id?: number;
    nombre: string;
    urlEnlace: string;
    iconoUrl: string;
    colorHex?: string | null;
    activo: boolean;
    iconoMediaBase64?: string;
    iconoMediaContentType?: string;
}

export type NewRedSocialDTO = Omit<RedSocialDTO, 'id'> & { id?: null };
