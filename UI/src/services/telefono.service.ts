import { apiClient } from '../api/axios-instance';
import type { TelefonoDTO, NewTelefonoDTO } from '../types/api/Telefono';

const base = '/telefonos';

export const TelefonoService = {
    getTelefonos: (params?: Record<string, any>) => apiClient.get<TelefonoDTO[]>(base, { params }),
    getTelefono: (id: number) => apiClient.get<TelefonoDTO>(`${base}/${id}`),
    createTelefono: (dto: NewTelefonoDTO) => apiClient.post<TelefonoDTO>(base, dto),
    updateTelefono: (id: number, dto: TelefonoDTO) => apiClient.put<TelefonoDTO>(`${base}/${id}`, dto),
    partialUpdateTelefono: (id: number, dto: Partial<TelefonoDTO>) => apiClient.patch<TelefonoDTO>(`${base}/${id}`, dto),
    deleteTelefono: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
