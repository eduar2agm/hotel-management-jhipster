import { apiClient } from '../api/axios-instance';
import type { ReservaDTO, NewReservaDTO } from '../types/api';

const base = '/reservas';

export const ReservaService = {
    getReservas: (params?: Record<string, any>) => apiClient.get<ReservaDTO[]>(base, { params }),
    getReserva: (id: number) => apiClient.get<ReservaDTO>(`${base}/${id}`),
    getReservasInactivas: (params?: Record<string, any>) => apiClient.get<ReservaDTO[]>(`${base}/inactive`, { params }),
    activarReserva: (id: number) => apiClient.put<void>(`${base}/${id}/activate`),
    desactivarReserva: (id: number) => apiClient.put<void>(`${base}/${id}/deactivate`),
    createReserva: (dto: NewReservaDTO) => apiClient.post<ReservaDTO>(base, dto),
    updateReserva: (id: number, dto: ReservaDTO) => apiClient.put<ReservaDTO>(`${base}/${id}`, dto),
    partialUpdateReserva: (id: number, dto: Partial<ReservaDTO>) => apiClient.patch<ReservaDTO>(`${base}/${id}`, dto),
    deleteReserva: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
