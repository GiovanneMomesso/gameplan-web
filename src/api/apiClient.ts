/**
 * Axios API Client Configuration
 * Configured with request/response interceptors for authentication and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_CONFIG } from './config';
import { tokenStorage } from './utils/tokenStorage';
import { createApiError } from './utils/errorHandler';

// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request Interceptor
 * Adds JWT token to all requests if available
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(createApiError(error));
    }
);

/**
 * Response Interceptor
 * Handles common error scenarios
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const apiError = createApiError(error);

        // Handle 401 Unauthorized or 403 Forbidden - redirect to login
        if (error.response?.status === 401 || error.response?.status === 403) {
            tokenStorage.removeToken();
            // Redirect to login page
            window.location.href = '/login';
        }

        return Promise.reject(apiError);
    }
);

export default apiClient;
