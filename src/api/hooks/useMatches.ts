/**
 * Match Hooks
 * React Query hooks for match operations
 */

import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { matchService } from '../services';
import { MatchCreateRequest, MatchUpdateRequest, MatchSummary } from '../models';
import { ApiError } from '../utils/errorHandler';

/**
 * Hook for creating a match
 */
export const useCreateMatch = (): UseMutationResult<
    MatchSummary,
    ApiError,
    MatchCreateRequest
> => {
    return useMutation({
        mutationFn: (data: MatchCreateRequest) => matchService.createMatch(data),
    });
};

/**
 * Hook for updating a match
 */
export const useUpdateMatch = (): UseMutationResult<
    MatchSummary,
    ApiError,
    { matchId: number; data: MatchUpdateRequest }
> => {
    return useMutation({
        mutationFn: ({ matchId, data }) => matchService.updateMatch(matchId, data),
    });
};

/**
 * Hook for deleting a match
 */
export const useDeleteMatch = (): UseMutationResult<void, ApiError, number> => {
    return useMutation({
        mutationFn: (matchId: number) => matchService.deleteMatch(matchId),
    });
};

/**
 * Hook for applying to a match
 */
export const useApplyForMatch = (): UseMutationResult<
    void,
    ApiError,
    { matchId: number; position?: string | null }
> => {
    return useMutation({
        mutationFn: ({ matchId, position }) =>
            matchService.applyForMatch(matchId, { position: position ?? null }),
    });
};

/**
 * Hook for removing a user from a match
 */
export const useRemoveUserFromMatch = (): UseMutationResult<
    void,
    ApiError,
    { matchId: number; userId: number }
> => {
    return useMutation({
        mutationFn: ({ matchId, userId }) =>
            matchService.removeUserFromMatch(matchId, userId),
    });
};

/**
 * Hook for canceling match application
 */
export const useCancelMatchApplication = (): UseMutationResult<void, ApiError, number> => {
    return useMutation({
        mutationFn: (matchId: number) => matchService.cancelMatchApplication(matchId),
    });
};
