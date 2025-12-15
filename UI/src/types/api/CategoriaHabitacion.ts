// Backend enum values (using const object for runtime values)
export const CategoriaHabitacionNombre = {
    SENCILLA: 'SENCILLA',
    DOBLE: 'DOBLE',
    SUITE: 'SUITE'
} as const;

export type CategoriaHabitacionNombreType = typeof CategoriaHabitacionNombre[keyof typeof CategoriaHabitacionNombre];

export interface CategoriaHabitacionDTO {
    id?: number;
    nombre?: CategoriaHabitacionNombreType; // enum
    descripcion?: string | null;
    precioBase?: string | null; // BigDecimal as string
    activo?: boolean;
}

export type NewCategoriaHabitacionDTO = Omit<CategoriaHabitacionDTO, 'id'> & { id?: null };
