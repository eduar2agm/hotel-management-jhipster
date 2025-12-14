export interface EstadoHabitacionDTO {
    id?: number;
    nombre?: string; // enum
    descripcion?: string | null;
    activo?: boolean;
}

export type NewEstadoHabitacionDTO = Omit<EstadoHabitacionDTO, 'id'> & { id?: null };
