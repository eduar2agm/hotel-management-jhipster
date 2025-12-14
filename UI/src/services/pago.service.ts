import { apiClient } from '../api/axios-instance';
import type { PagoDTO, NewPagoDTO } from '../types/api';

const base = '/pagos';

export const PagoService = {
    getPagos: (params?: Record<string, any>) => apiClient.get<PagoDTO[]>(base, { params }),
    getPago: (id: number) => apiClient.get<PagoDTO>(`${base}/${id}`),
    createPago: (dto: NewPagoDTO) => apiClient.post<PagoDTO>(base, dto),
    updatePago: (id: number, dto: PagoDTO) => apiClient.put<PagoDTO>(`${base}/${id}`, dto),
    partialUpdatePago: (id: number, dto: Partial<PagoDTO>) => apiClient.patch<PagoDTO>(`${base}/${id}`, dto),
    deletePago: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
