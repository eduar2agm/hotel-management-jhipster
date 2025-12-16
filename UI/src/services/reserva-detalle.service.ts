import { apiClient } from '../api/axios-instance';
import type { ReservaDetalleDTO, NewReservaDetalleDTO } from '../types/api';

const base = '/api/reserva-detalles';

export const ReservaDetalleService = {
    getReservaDetalles: (params?: Record<string, any>) => apiClient.get<ReservaDetalleDTO[]>(base, { params }),
    getReservaDetalle: (id: number) => apiClient.get<ReservaDetalleDTO>(`${base}/${id}`),
    createReservaDetalle: (dto: NewReservaDetalleDTO) => apiClient.post<ReservaDetalleDTO>(base, dto),
    updateReservaDetalle: (id: number, dto: ReservaDetalleDTO) => apiClient.put<ReservaDetalleDTO>(`${base}/${id}`, dto),
    partialUpdateReservaDetalle: (id: number, dto: Partial<ReservaDetalleDTO>) => apiClient.patch<ReservaDetalleDTO>(`${base}/${id}`, dto),
    deleteReservaDetalle: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
