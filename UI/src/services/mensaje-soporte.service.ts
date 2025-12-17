import { apiClient } from '../api/axios-instance';
import type { MensajeSoporteDTO, NewMensajeSoporteDTO } from '../types/api';

const base = '/mensaje-soportes';

export const MensajeSoporteService = {
    getMensajes: (params?: Record<string, any>) => apiClient.get<MensajeSoporteDTO[]>(base, { params }),
    getMyMensajes: (params?: Record<string, any>) => apiClient.get<MensajeSoporteDTO[]>(`${base}/my-messages`, { params }),
    getMensaje: (id: number) => apiClient.get<MensajeSoporteDTO>(`${base}/${id}`),
    getMensajesInactivos: (params?: Record<string, any>) => apiClient.get<MensajeSoporteDTO[]>(`${base}/inactive`, { params }),
    activarMensaje: (id: number) => apiClient.put<void>(`${base}/${id}/activate`),
    desactivarMensaje: (id: number) => apiClient.put<void>(`${base}/${id}/deactivate`),
    createMensaje: (dto: NewMensajeSoporteDTO) => apiClient.post<MensajeSoporteDTO>(base, dto),
    updateMensaje: (id: number, dto: MensajeSoporteDTO) => apiClient.put<MensajeSoporteDTO>(`${base}/${id}`, dto),
    partialUpdateMensaje: (id: number, dto: Partial<MensajeSoporteDTO>) => apiClient.patch<MensajeSoporteDTO>(`${base}/${id}`, dto),
    deleteMensaje: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
