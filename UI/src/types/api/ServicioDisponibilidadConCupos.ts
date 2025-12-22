import type { ServicioDisponibilidadDTO } from './ServicioDisponibilidad';

/**
 * DTO que extiende ServicioDisponibilidadDTO para incluir información de cupos
 */
export interface ServicioDisponibilidadConCuposDTO extends ServicioDisponibilidadDTO {
    cuposOcupados: number;
    cuposDisponibles: number;
    fecha?: string | null; // Fecha específica en formato 'yyyy-MM-dd'
}
