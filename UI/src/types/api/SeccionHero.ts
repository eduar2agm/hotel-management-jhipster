export interface SeccionHeroDTO {
    id?: number;
    titulo?: string;
    descripcion?: string;
    imagenFondoUrl?: string;
    textoBoton?: string;
    enlaceBoton?: string;
    orden?: number;
    activo?: boolean;
}

export type NewSeccionHeroDTO = Omit<SeccionHeroDTO, 'id'> & { id?: null };
