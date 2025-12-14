/**
 * Authentication Hooks
 * React Query hooks for authentication operations
 */

import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services';
import { LoginRequest, LoginResponse, UserCreateRequest } from '../models';
import { ApiError } from '../utils/errorHandler';

/**
 * Hook for user login
 */
export const useLogin = (): UseMutationResult<
    LoginResponse,
    ApiError,
    LoginRequest
> => {
    return useMutation({
        mutationFn: (data: LoginRequest) => authService.login(data),
    });
};

/**
 * Hook for user registration
 */
export const useRegister = (): UseMutationResult<
    string,
    ApiError,
    UserCreateRequest
> => {
    return useMutation({
        mutationFn: (data: UserCreateRequest) => authService.register(data),
    });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
    const queryClient = useQueryClient();

    const logout = () => {
        authService.logout();
        queryClient.removeQueries();
    };

    return { logout };
};

/**
 * Hook to check authentication status
 */
export const useIsAuthenticated = (): boolean => {
    return authService.isAuthenticated();
};
