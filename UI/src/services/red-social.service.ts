import { apiClient } from '../api/axios-instance';
import type { RedSocialDTO, NewRedSocialDTO } from '../types/api/RedSocial';

const base = '/red-socials';

export const RedSocialService = {
  getRedSocials: (params?: any) => apiClient.get<RedSocialDTO[]>(base, { params }),
  getRedSocial: (id: number) => apiClient.get<RedSocialDTO>(`${base}/${id}`),
  createRedSocial: (dto: NewRedSocialDTO) => apiClient.post<RedSocialDTO>(base, dto),
  updateRedSocial: (id: number, dto: RedSocialDTO) => apiClient.put<RedSocialDTO>(`${base}/${id}`, dto),
  partialUpdateRedSocial: (id: number, dto: Partial<RedSocialDTO>) => apiClient.patch<RedSocialDTO>(`${base}/${id}`, dto),
  deleteRedSocial: (id: number) => apiClient.delete<void>(`${base}/${id}`),
};
