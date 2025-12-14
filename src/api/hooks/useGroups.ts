/**
 * Group Hooks
 * React Query hooks for group operations
 */

import {
    useQuery,
    useMutation,
    UseQueryResult,
    UseMutationResult,
} from '@tanstack/react-query';
import { groupService } from '../services';
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
import { ApiError } from '../utils/errorHandler';

// Query keys for caching
export const groupKeys = {
    all: ['groups'] as const,
    lists: () => [...groupKeys.all, 'list'] as const,
    list: () => [...groupKeys.lists()] as const,
    matches: (groupId: number) => [...groupKeys.all, 'matches', groupId] as const,
    invites: (groupId: number) => [...groupKeys.all, 'invites', groupId] as const,
    members: (groupId: number) => [...groupKeys.all, 'members', groupId] as const,
};

/**
 * Hook for fetching user's groups
 */
export const useUserGroups = (): UseQueryResult<GroupSummary[], ApiError> => {
    return useQuery({
        queryKey: groupKeys.list(),
        queryFn: () => groupService.getUserGroups(),
    });
};

/**
 * Hook for fetching group matches
 */
export const useGroupMatches = (
    groupId: number
): UseQueryResult<MatchSummary[], ApiError> => {
    return useQuery({
        queryKey: groupKeys.matches(groupId),
        queryFn: () => groupService.getGroupMatches(groupId),
        enabled: !!groupId, // Only fetch if groupId is provided
    });
};

/**
 * Hook for fetching invite requests
 */
export const useInviteRequests = (
    groupId: number
): UseQueryResult<InviteRequestResponse[], ApiError> => {
    return useQuery({
        queryKey: groupKeys.invites(groupId),
        queryFn: () => groupService.getInviteRequests(groupId),
        enabled: !!groupId, // Only fetch if groupId is provided
    });
};

/**
 * Hook for creating a group
 */
export const useCreateGroup = (): UseMutationResult<
    GroupResponse,
    ApiError,
    CreateGroupRequest
> => {
    return useMutation({
        mutationFn: (data: CreateGroupRequest) => groupService.createGroup(data),
    });
};

/**
 * Hook for creating an invite
 */
export const useCreateInvite = (): UseMutationResult<
    InviteResponse,
    ApiError,
    { groupId: number; data: CreateInviteRequest }
> => {
    return useMutation({
        mutationFn: ({ groupId, data }) => groupService.createInvite(groupId, data),
    });
};

/**
 * Hook for submitting an invite
 */
export const useSubmitInvite = (): UseMutationResult<
    number,
    ApiError,
    SubmitInviteRequest
> => {
    return useMutation({
        mutationFn: (data: SubmitInviteRequest) => groupService.submitInvite(data),
    });
};

/**
 * Hook for fetching group members
 */
export const useGroupMembers = (
    groupId: number
): UseQueryResult<GroupMember[], ApiError> => {
    return useQuery({
        queryKey: groupKeys.members(groupId),
        queryFn: () => groupService.getGroupMembers(groupId),
        enabled: !!groupId, // Only fetch if groupId is provided
    });
};
