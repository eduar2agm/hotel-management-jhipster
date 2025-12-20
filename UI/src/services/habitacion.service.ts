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
    createHabitacionWithImage: (dto: NewHabitacionDTO, file: File) => {
        const formData = new FormData();
        formData.append('habitacion', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
        formData.append('image', file);
        return apiClient.post<HabitacionDTO>(base, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    updateHabitacion: (id: number, dto: HabitacionDTO) => apiClient.put<HabitacionDTO>(`${base}/${id}`, dto),
    updateHabitacionWithImage: (id: number, dto: HabitacionDTO, file: File) => {
        const formData = new FormData();
        formData.append('habitacion', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
        formData.append('image', file);
        return apiClient.put<HabitacionDTO>(`${base}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    partialUpdateHabitacion: (id: number, dto: Partial<HabitacionDTO>) => apiClient.patch<HabitacionDTO>(`${base}/${id}`, dto),
    deleteHabitacion: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
