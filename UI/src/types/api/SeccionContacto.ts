export interface SeccionContactoDTO {
    id?: number;
    titulo: string;
    descripcion: string;
    imagenFondoUrl: string;
    correo?: string | null;
    activo: boolean;
}

export type NewSeccionContactoDTO = Omit<SeccionContactoDTO, 'id'> & { id?: null };
