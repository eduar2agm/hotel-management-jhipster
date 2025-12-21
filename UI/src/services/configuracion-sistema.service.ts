import { apiClient } from '../api/axios-instance';
import type { ConfiguracionSistemaDTO, NewConfiguracionSistemaDTO } from '../types/api/ConfiguracionSistema';

const base = '/configuracion-sistemas';

export const ConfiguracionSistemaService = {
    getConfiguraciones: (params?: Record<string, any>) => apiClient.get<ConfiguracionSistemaDTO[]>(base, { params }),
    getConfiguracion: (id: number) => apiClient.get<ConfiguracionSistemaDTO>(`${base}/${id}`),
    getConfiguracionByClave: (clave: string) => apiClient.get<ConfiguracionSistemaDTO>(`${base}/clave/${clave}`),
    createConfiguracion: (dto: NewConfiguracionSistemaDTO) => apiClient.post<ConfiguracionSistemaDTO>(base, dto),
    updateConfiguracion: (id: number, dto: ConfiguracionSistemaDTO) => apiClient.put<ConfiguracionSistemaDTO>(`${base}/${id}`, dto),
    partialUpdateConfiguracion: (id: number, dto: Partial<ConfiguracionSistemaDTO>) => apiClient.patch<ConfiguracionSistemaDTO>(`${base}/${id}`, dto),
    deleteConfiguracion: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
