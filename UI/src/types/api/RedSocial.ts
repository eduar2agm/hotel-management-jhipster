export interface RedSocialDTO {
    id?: number;
    nombre: string;
    urlEnlace: string;
    iconoUrl: string;
    colorHex?: string | null;
    activo: boolean;
}

export type NewRedSocialDTO = Omit<RedSocialDTO, 'id'> & { id?: null };
