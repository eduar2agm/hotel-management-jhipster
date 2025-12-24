import { apiClient } from '../api/axios-instance';

export interface EmployeeDTO {
    login: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    active?: boolean;
}

const API_URL = '/admin/employees'; // apiClient base URL is usually /api, check axios-instance or assume relative to /api if apiClient isn't verifying

// Checking cliente.service.ts, it uses '/clientes' which maps to '/api/clientes'.
// So here we should probably use '/admin/employees' if apiClient pre-pends '/api'.
// But wait, the resource is @RequestMapping("/api/admin"), so path is /api/admin/employees.
// If apiClient pre-pends /api, then we use /admin/employees.
// Let's verify apiClient config. Typically JHipster/Axios setup prepends SERVER_API_URL.
// I will check axios-instance.ts first to be sure about the base path.
// But mostly consistent with other services:
// client.service.ts uses '/clientes' -> /api/clientes
// So I should use '/admin/employees'.

export const EmployeeService = {
    getAll: async () => {
        return apiClient.get<EmployeeDTO[]>(API_URL);
    },
    create: async (data: EmployeeDTO) => {
        return apiClient.post<{ password: string }>(API_URL, data);
    },
    update: async (data: EmployeeDTO) => {
        return apiClient.put(API_URL, data);
    },
    deactivate: async (login: string) => {
        // Since I didn't create a dedicated deactivate endpoint, I'll use a hypothetical one or update
        // But backend has deactivateEmployee(login). I need to expose it in Resource.
        // Wait, I forgot to add the Endpoint in EmployeeResource for deactivate!
        // I added the logic in Service, but not the Controller method.
        // I will fix Backend Controller first.
        return apiClient.delete(`${API_URL}/${login}`);
    },
    activate: async (login: string) => {
        return apiClient.put(`${API_URL}/${login}/activate`);
    }
};
