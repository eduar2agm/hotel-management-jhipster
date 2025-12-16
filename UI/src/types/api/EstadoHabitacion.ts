// Backend enum values (using const object for runtime values)
export const EstadoHabitacionNombre = {
    DISPONIBLE: 'DISPONIBLE',
    OCUPADA: 'OCUPADA',
    LIMPIEZA: 'LIMPIEZA',
    MANTENIMIENTO: 'MANTENIMIENTO'
} as const;

export type EstadoHabitacionNombreType = typeof EstadoHabitacionNombre[keyof typeof EstadoHabitacionNombre];

export interface EstadoHabitacionDTO {
    id?: number;
    nombre?: EstadoHabitacionNombreType; // enum
    descripcion?: string | null;
    activo?: boolean;
}

export type NewEstadoHabitacionDTO = Omit<EstadoHabitacionDTO, 'id'> & { id?: null };
