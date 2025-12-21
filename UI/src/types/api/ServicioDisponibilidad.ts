import type { ServicioDTO } from './Servicio';
import type { DiaSemana } from '../enums';

export interface ServicioDisponibilidadDTO {
    id: number;
    diaSemana: DiaSemana;
    horaInicio: string; // Time as string 'HH:mm:ss'
    horaFin?: string | null;
    cupoMaximo: number;
    horaFija: boolean;
    activo: boolean;
    servicio?: ServicioDTO | null;
}

export type NewServicioDisponibilidadDTO = Omit<ServicioDisponibilidadDTO, 'id'> | { id?: null };
