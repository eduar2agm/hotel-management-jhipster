import { apiClient } from '../api/axios-instance';
import type { HabitacionDTO, NewHabitacionDTO } from '../types/api';

const base = '/habitacions';

export const HabitacionService = {
    getHabitacions: (params?: Record<string, any>) => apiClient.get<HabitacionDTO[]>(base, { params }),
    getHabitacion: (id: number) => apiClient.get<HabitacionDTO>(`${base}/${id}`),
    getHabitacionesInactivas: (params?: Record<string, any>) => apiClient.get<HabitacionDTO[]>(`${base}/inactive`, { params }),
    activarHabitacion: (id: number) => apiClient.put<void>(`${base}/${id}/activate`),
    desactivarHabitacion: (id: number) => apiClient.put<void>(`${base}/${id}/deactivate`),
    createHabitacion: (dto: NewHabitacionDTO) => apiClient.post<HabitacionDTO>(base, dto),
    updateHabitacion: (id: number, dto: HabitacionDTO) => apiClient.put<HabitacionDTO>(`${base}/${id}`, dto),
    partialUpdateHabitacion: (id: number, dto: Partial<HabitacionDTO>) => apiClient.patch<HabitacionDTO>(`${base}/${id}`, dto),
    deleteHabitacion: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
