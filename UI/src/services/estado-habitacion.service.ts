import { apiClient } from '../api/axios-instance';
import type { EstadoHabitacionDTO, NewEstadoHabitacionDTO } from '../types/api';

const base = '/estado-habitacions';

export const EstadoHabitacionService = {
    getEstados: (params?: Record<string, any>) => apiClient.get<EstadoHabitacionDTO[]>(base, { params }),
    getEstado: (id: number) => apiClient.get<EstadoHabitacionDTO>(`${base}/${id}`),
    getEstadosInactivos: (params?: Record<string, any>) => apiClient.get<EstadoHabitacionDTO[]>(`${base}/inactive`, { params }),
    activarEstado: (id: number) => apiClient.put<void>(`${base}/${id}/activate`),
    desactivarEstado: (id: number) => apiClient.put<void>(`${base}/${id}/deactivate`),
    createEstado: (dto: NewEstadoHabitacionDTO) => apiClient.post<EstadoHabitacionDTO>(base, dto),
    updateEstado: (id: number, dto: EstadoHabitacionDTO) => apiClient.put<EstadoHabitacionDTO>(`${base}/${id}`, dto),
    partialUpdateEstado: (id: number, dto: Partial<EstadoHabitacionDTO>) => apiClient.patch<EstadoHabitacionDTO>(`${base}/${id}`, dto),
    deleteEstado: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
