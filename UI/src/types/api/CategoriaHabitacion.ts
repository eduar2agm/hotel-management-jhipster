export interface CategoriaHabitacionDTO {
    id?: number;
    nombre?: string; // enum
    descripcion?: string | null;
    precioBase?: string | null; // BigDecimal as string
    activo?: boolean;
}

export type NewCategoriaHabitacionDTO = Omit<CategoriaHabitacionDTO, 'id'> & { id?: null };
