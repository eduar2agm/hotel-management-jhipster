import type { CategoriaHabitacionDTO } from './CategoriaHabitacion';
import type { EstadoHabitacionDTO } from './EstadoHabitacion';

export interface HabitacionDTO {
    id?: number;
    numero: string;
    capacidad: number;
    descripcion?: string | null;
    imagen?: string | null;
    activo?: boolean;
    categoriaHabitacion?: CategoriaHabitacionDTO | null;
    estadoHabitacion?: EstadoHabitacionDTO | null;
}

export type NewHabitacionDTO = Omit<HabitacionDTO, 'id'> & { id?: null };
