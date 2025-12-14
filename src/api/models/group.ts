/**
 * Group Models
 */

import { UserSummary } from './user';

export interface CreateGroupRequest {
    name: string;
}

export interface GroupResponse {
    id: number;
    name: string;
    adminId: number;
}

export interface GroupSummary {
    id: number;
    name: string;
    adminId: number;
    adminName: string;
    members: UserSummary[];
}

export interface CreateInviteRequest {
    invitedUserId?: number;
}

export interface InviteResponse {
    secretHash: string;
}

export interface SubmitInviteRequest {
    secretHash: string;
}

export interface InviteRequestResponse {
    requesterName: string;
    requestedAt: string; // ISO 8601 date-time string
    requestSecret: string;
    accepted: boolean;
}

export interface GroupMember {
    id: number;
    name: string;
}
