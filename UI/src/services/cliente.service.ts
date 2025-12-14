import { apiClient } from '../api/axios-instance';
import type { ClienteDTO, NewClienteDTO } from '../types/api';

const base = '/api/clientes';

export const ClienteService = {
    getClientes: (params?: Record<string, any>) => apiClient.get<ClienteDTO[]>(base, { params }),
    getCliente: (id: number) => apiClient.get<ClienteDTO>(`${base}/${id}`),
    createCliente: (dto: NewClienteDTO) => apiClient.post<ClienteDTO>(base, dto),
    updateCliente: (id: number, dto: ClienteDTO) => apiClient.put<ClienteDTO>(`${base}/${id}`, dto),
    partialUpdateCliente: (id: number, dto: Partial<ClienteDTO>) => apiClient.patch<ClienteDTO>(`${base}/${id}`, dto),
    deleteCliente: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
