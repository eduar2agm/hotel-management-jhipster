import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { apiClient, setAuthToken } from '../api/axios-instance';

export const useApiClient = () => {
    const { getAccessToken, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            const token = getAccessToken();
            setAuthToken(token);
        } else {
            setAuthToken(undefined);
        }
    }, [isAuthenticated, getAccessToken]);

    return apiClient;
};
