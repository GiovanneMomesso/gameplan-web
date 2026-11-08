/**
 * Match Service
 * Handles match-related operations
 */

import apiClient from '../apiClient';
import { MatchCreateRequest, MatchUpdateRequest, MatchSummary, ApplyForMatchRequest, AddGuestRequest, InviteResponse } from '../models';

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
     * Get a match by ID
     * @param matchId Match ID
     * @returns Match summary
     */
    getMatch: async (matchId: number): Promise<MatchSummary> => {
        const response = await apiClient.get<MatchSummary>(`/api/matches/${matchId}`);
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
     * Add a guest participant to a match
     * @param matchId Match ID
     * @param data Guest details
     */
    addGuest: async (matchId: number, data: AddGuestRequest): Promise<void> => {
        await apiClient.post(`/api/matches/${matchId}/admin/participants/guest`, data);
    },

    /**
     * Remove a participant (user or guest) by participant ID
     * @param matchId Match ID
     * @param participantId Participant unique ID (entry ID)
     */
    removeParticipant: async (matchId: number, participantId: number): Promise<void> => {
        await apiClient.delete(`/api/matches/${matchId}/admin/participants/entry/${participantId}`);
    },

    /**
     * Create an invite for a guest participant
     * @param matchId Match ID
     * @param participantId Participant unique ID
     * @returns Invite response with secret hash
     */
    createGuestInvite: async (matchId: number, participantId: number): Promise<InviteResponse> => {
        const response = await apiClient.post<InviteResponse>(
            `/api/matches/${matchId}/participants/${participantId}/invite`
        );
        return response.data;
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

    /**
     * Approve a participant for a match
     * @param matchId Match ID
     * @param participantId Participant ID
     */
    approveParticipant: async (matchId: number, participantId: number): Promise<void> => {
        await apiClient.post(`/api/matches/${matchId}/admin/participants/${participantId}/approve`);
    },

    /**
     * Reject a participant for a match
     * @param matchId Match ID
     * @param participantId Participant ID
     */
    rejectParticipant: async (matchId: number, participantId: number): Promise<void> => {
        await apiClient.delete(`/api/matches/${matchId}/admin/participants/${participantId}/reject`);
    },

    /**
     * Update participant's team and position
     * @param matchId Match ID
     * @param participantId Participant ID
     * @param position Optional position
     * @param teamName Optional team name
     */
    updateParticipantTeamPosition: async (matchId: number, participantId: number, position?: string, teamName?: string): Promise<void> => {
        await apiClient.patch(`/api/matches/${matchId}/admin/participants/${participantId}/team-position`, { position, teamName });
    },
};
