/**
 * User Service
 * Handles user-related operations
 */

import apiClient from '../apiClient';
import { UserCreateRequest, UserResponse } from '../models';

export const userService = {
    /**
     * Create a new user
     * @param data User creation data
     * @returns Created user response
     */
    createUser: async (data: UserCreateRequest): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>('/api/users', data);
        return response.data;
    },

    /**
     * Get current logged in user
     * @returns Current user summary
     */
    getMe: async (): Promise<{ id: number; name: string }> => {
        const response = await apiClient.get<{ id: number; name: string }>('/api/users/me');
        return response.data;
    },
};
