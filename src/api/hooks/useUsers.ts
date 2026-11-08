/**
 * User Hooks
 * React Query hooks for user operations
 */

import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query';
import { userService } from '../services';
import { UserCreateRequest, UserResponse, UserUpdateRequest } from '../models';
import { ApiError } from '../utils/errorHandler';

/**
 * Hook for creating a user
 */
export const useCreateUser = (): UseMutationResult<
    UserResponse,
    ApiError,
    UserCreateRequest
> => {
    return useMutation({
        mutationFn: (data: UserCreateRequest) => userService.createUser(data),
    });
};

/**
 * Hook for getting current user
 */
export const useCurrentUser = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['users', 'me'],
        queryFn: () => userService.getMe(),
        retry: false,
        enabled,
    });
};

/**
 * Hook for updating current user
 */
export const useUpdateUser = (): UseMutationResult<
    { id: number; name: string },
    ApiError,
    UserUpdateRequest
> => {
    return useMutation({
        mutationFn: (data: UserUpdateRequest) => userService.updateMe(data),
    });
};
