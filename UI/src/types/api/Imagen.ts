import type { HabitacionDTO } from './Habitacion';
import type { ServicioDTO } from './Servicio';

export interface ImagenDTO {
    id?: number;
    nombre: string;
    descripcion?: string | null;
    fichero?: string | null; // bytes are typically handled as strings in JSON
    ficheroContentType?: string | null;
    nombreArchivo?: string | null;
    activo: boolean;
    fechaCreacion?: string | null;
    habitacion?: HabitacionDTO | null;
    servicio?: ServicioDTO | null;
}

export type NewImagenDTO = Omit<ImagenDTO, 'id'> & { id?: null };
