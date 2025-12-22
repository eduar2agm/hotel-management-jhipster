export interface RedSociallandingDTO {
    id?: number;
    nombre: string;
    urlEnlace: string;
    iconoUrl: string;
    colorHex?: string | null;
    activo: boolean;
}

export type NewRedSociallandingDTO = Omit<RedSociallandingDTO, 'id'> & { id?: null };
