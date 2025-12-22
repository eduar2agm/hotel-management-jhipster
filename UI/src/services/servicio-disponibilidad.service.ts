import { apiClient } from '../api/axios-instance';
import type { ServicioDisponibilidadDTO, NewServicioDisponibilidadDTO } from '../types/api/ServicioDisponibilidad';
import type { ServicioDisponibilidadConCuposDTO } from '../types/api/ServicioDisponibilidadConCupos';
import type { DiaSemana } from '../types/enums';

const base = '/servicio-disponibilidads';

export const ServicioDisponibilidadService = {
    getAll: (params?: Record<string, any>) => apiClient.get<ServicioDisponibilidadDTO[]>(base, { params }),

    getById: (id: number) => apiClient.get<ServicioDisponibilidadDTO>(`${base}/${id}`),

    // Custom filter endpoint to get by service
    getByServicio: (servicioId: number) => apiClient.get<ServicioDisponibilidadDTO[]>(`${base}/servicio/${servicioId}`),

    // Get disponibilidad con cupos in a date range
    getDisponibilidadConCupos: (servicioId: number, fechaInicio?: string, fechaFin?: string) => {
        const params: any = {};
        if (fechaInicio) params.fechaInicio = fechaInicio;
        if (fechaFin) params.fechaFin = fechaFin;
        return apiClient.get<ServicioDisponibilidadConCuposDTO[]>(`${base}/servicio/${servicioId}/cupos`, { params });
    },

    create: (dto: NewServicioDisponibilidadDTO) => apiClient.post<ServicioDisponibilidadDTO>(base, dto),

    update: (id: number, dto: ServicioDisponibilidadDTO) => apiClient.put<ServicioDisponibilidadDTO>(`${base}/${id}`, dto),

    partialUpdate: (id: number, dto: Partial<ServicioDisponibilidadDTO>) => apiClient.patch<ServicioDisponibilidadDTO>(`${base}/${id}`, dto),

    delete: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
