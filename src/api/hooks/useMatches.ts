/**
 * Match Hooks
 * React Query hooks for match operations
 */

import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import { matchService } from '../services';
import { MatchCreateRequest, MatchUpdateRequest, MatchSummary, AddGuestRequest, InviteResponse } from '../models';
import { ApiError } from '../utils/errorHandler';

/**
 * Hook for getting a match by ID
 */
export const useMatch = (matchId?: number): UseQueryResult<MatchSummary, ApiError> => {
    return useQuery({
        queryKey: ['match', matchId],
        queryFn: () => matchService.getMatch(matchId!),
        enabled: !!matchId,
    });
};

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
 * Hook for adding a guest to a match
 */
export const useAddGuest = (): UseMutationResult<
    void,
    ApiError,
    { matchId: number; data: AddGuestRequest }
> => {
    return useMutation({
        mutationFn: ({ matchId, data }) => matchService.addGuest(matchId, data),
    });
};

/**
 * Hook for removing a participant (user or guest) from a match
 */
export const useRemoveParticipant = (): UseMutationResult<
    void,
    ApiError,
    { matchId: number; participantId: number }
> => {
    return useMutation({
        mutationFn: ({ matchId, participantId }) => matchService.removeParticipant(matchId, participantId),
    });
};

/**
 * Hook for creating a guest invite
 */
export const useCreateGuestInvite = (): UseMutationResult<
    InviteResponse,
    ApiError,
    { matchId: number; participantId: number }
> => {
    return useMutation({
        mutationFn: ({ matchId, participantId }) => matchService.createGuestInvite(matchId, participantId),
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

/**
 * Hook for approving a participant
 */
export const useApproveParticipant = (): UseMutationResult<
    void,
    ApiError,
    { matchId: number; participantId: number }
> => {
    return useMutation({
        mutationFn: ({ matchId, participantId }) => matchService.approveParticipant(matchId, participantId),
    });
};

/**
 * Hook for rejecting a participant
 */
export const useRejectParticipant = (): UseMutationResult<
    void,
    ApiError,
    { matchId: number; participantId: number }
> => {
    return useMutation({
        mutationFn: ({ matchId, participantId }) => matchService.rejectParticipant(matchId, participantId),
    });
};

/**
 * Hook for updating participant team and position
 */
export const useUpdateParticipantTeamPosition = (): UseMutationResult<
    void,
    ApiError,
    { matchId: number; participantId: number; position?: string; teamName?: string }
> => {
    return useMutation({
        mutationFn: ({ matchId, participantId, position, teamName }) => 
            matchService.updateParticipantTeamPosition(matchId, participantId, position, teamName),
    });
};
