/**
 * Match Service
 * Handles match-related operations
 */

import apiClient from '../apiClient';
import { MatchCreateRequest, MatchUpdateRequest, MatchSummary, ApplyForMatchRequest } from '../models';

export const matchService = {
    /**
     * Create a new match
     * @param data Match creation data
     * @returns Created match summary
     */
    createMatch: async (data: MatchCreateRequest): Promise<MatchSummary> => {
        const response = await apiClient.post<MatchSummary>('/api/matches', data);
        return response.data;
    },

    /**
     * Update a match
     * @param matchId Match ID
     * @param data Match update data
     * @returns Updated match summary
     */
    updateMatch: async (
        matchId: number,
        data: MatchUpdateRequest
    ): Promise<MatchSummary> => {
        const response = await apiClient.put<MatchSummary>(
            `/api/matches/${matchId}/admin`,
            data
        );
        return response.data;
    },

    /**
     * Delete a match
     * @param matchId Match ID
     */
    deleteMatch: async (matchId: number): Promise<void> => {
        await apiClient.delete(`/api/matches/${matchId}`);
    },

    /**
     * Remove a user from a match
     * @param matchId Match ID
     * @param userId User ID
     */
    removeUserFromMatch: async (matchId: number, userId: number): Promise<void> => {
        await apiClient.delete(`/api/matches/${matchId}/admin/participants/${userId}`);
    },

    /**
     * Apply for a match
     * @param matchId Match ID
     * @param data Optional application data (e.g. position)
     */
    applyForMatch: async (matchId: number, data?: ApplyForMatchRequest): Promise<void> => {
        await apiClient.post(`/api/matches/${matchId}/apply`, data);
    },

    /**
     * Cancel application to a match
     * @param matchId Match ID
     */
    cancelMatchApplication: async (matchId: number): Promise<void> => {
        await apiClient.delete(`/api/matches/${matchId}/apply`);
    },
};
