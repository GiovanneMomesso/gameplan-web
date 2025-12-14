/**
 * User Hooks
 * React Query hooks for user operations
 */

import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query';
import { userService } from '../services';
import { UserCreateRequest, UserResponse } from '../models';
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
