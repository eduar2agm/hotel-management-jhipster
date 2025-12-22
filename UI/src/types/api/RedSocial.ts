export interface RedSocialDTO {
    id?: number;
    nombre?: string;
    urlEnlace?: string;
    iconoUrl?: string; // Could be a Lucide icon name or URL
    colorHex?: string;
    activo?: boolean;
}

export type NewRedSocialDTO = Omit<RedSocialDTO, 'id'> & { id?: null };
