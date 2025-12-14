/**
 * Group Service
 * Handles group-related operations
 */

import apiClient from '../apiClient';
import {
    CreateGroupRequest,
    GroupResponse,
    GroupSummary,
    CreateInviteRequest,
    InviteResponse,
    SubmitInviteRequest,
    InviteRequestResponse,
    MatchSummary,
    GroupMember,
} from '../models';

export const groupService = {
    /**
     * Get user's groups
     * @returns List of groups the user is a member of
     */
    getUserGroups: async (): Promise<GroupSummary[]> => {
        const response = await apiClient.get<GroupSummary[]>('/api/groups');
        return response.data;
    },

    /**
     * Create a new group
     * @param data Group creation data
     * @returns Created group response
     */
    createGroup: async (data: CreateGroupRequest): Promise<GroupResponse> => {
        const response = await apiClient.post<GroupResponse>('/api/groups', data);
        return response.data;
    },

    /**
     * Get matches for a specific group
     * @param groupId Group ID
     * @returns List of matches for the group
     */
    getGroupMatches: async (groupId: number): Promise<MatchSummary[]> => {
        const response = await apiClient.get<MatchSummary[]>(
            `/api/groups/group/${groupId}/matches`
        );
        return response.data;
    },

    /**
     * Create an invite for a group
     * @param groupId Group ID
     * @param data Invite creation data
     * @returns Invite response with secret hash
     */
    createInvite: async (
        groupId: number,
        data: CreateInviteRequest
    ): Promise<InviteResponse> => {
        const response = await apiClient.post<InviteResponse>(
            `/api/groups/${groupId}/invite`,
            data
        );
        return response.data;
    },

    /**
     * Get invite requests for a group
     * @param groupId Group ID
     * @returns List of invite requests
     */
    getInviteRequests: async (groupId: number): Promise<InviteRequestResponse[]> => {
        const response = await apiClient.get<InviteRequestResponse[]>(
            `/api/groups/${groupId}/invites`
        );
        return response.data;
    },

    /**
     * Submit an invite
     * @param data Submit invite data
     */
    submitInvite: async (data: SubmitInviteRequest): Promise<number> => {
        const response = await apiClient.post<number>('/api/groups/invites/submit', data);
        return response.data;
    },

    /**
     * Get members of a group
     * @param groupId Group ID
     * @returns List of group members
     */
    getGroupMembers: async (groupId: number): Promise<GroupMember[]> => {
        const response = await apiClient.get<GroupMember[]>(
            `/api/groups/${groupId}/members`
        );
        return response.data;
    },
};
