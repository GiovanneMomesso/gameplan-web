/**
 * Authentication Service
 * Handles user registration and login
 */

import apiClient from '../apiClient';
import { LoginRequest, LoginResponse, UserCreateRequest } from '../models';
import { tokenStorage } from '../utils/tokenStorage';

export const authService = {
    /**
     * Register a new user
     * @param data User registration data
     * @returns Success message
     */
    register: async (data: UserCreateRequest): Promise<string> => {
        const response = await apiClient.post<string>('/auth/register', data);
        return response.data;
    },

    /**
     * Login user
     * @param data Login credentials
     * @returns Login response with JWT token
     */
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', data);

        // Store the token
        if (response.data.token) {
            tokenStorage.setToken(response.data.token);
        }

        return response.data;
    },

    /**
     * Logout user
     * Removes the stored token
     */
    logout: (): void => {
        tokenStorage.removeToken();
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return tokenStorage.hasToken();
    },
};
