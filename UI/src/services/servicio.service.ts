import { apiClient } from '../api/axios-instance';
import type { ServicioDTO, NewServicioDTO } from '../types/api/Servicio';

const base = '/servicios';

export const ServicioService = {
    getServicios: (params?: Record<string, any>) => apiClient.get<ServicioDTO[]>(base, { params }),
    getServiciosDisponibles: (params?: Record<string, any>) => apiClient.get<ServicioDTO[]>(`${base}/disponibles`, { params }),
    getServiciosGratuitos: (params?: Record<string, any>) => apiClient.get<ServicioDTO[]>(`${base}/gratuitos`, { params }),
    getServiciosPago: (params?: Record<string, any>) => apiClient.get<ServicioDTO[]>(`${base}/pago`, { params }),

    getServicio: (id: number) => apiClient.get<ServicioDTO>(`${base}/${id}`),

    createServicio: (dto: NewServicioDTO) => apiClient.post<ServicioDTO>(base, dto),
    updateServicio: (id: number, dto: ServicioDTO) => apiClient.put<ServicioDTO>(`${base}/${id}`, dto),
    partialUpdateServicio: (id: number, dto: Partial<ServicioDTO>) => apiClient.patch<ServicioDTO>(`${base}/${id}`, dto),
    deleteServicio: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
