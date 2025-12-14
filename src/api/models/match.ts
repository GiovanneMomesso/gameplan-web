/**
 * Match Models
 */

import { UserSummary } from './user';

export interface MatchCreateRequest {
    location: string;
    address: string;
    pricePerMember: number;
    maxParticipants: number;
    time: string; // ISO 8601 date-time string
    groupId: number;
    enablePositions?: boolean;
}

export interface MatchUpdateRequest {
    location?: string;
    address?: string;
    pricePerMember?: number;
    maxParticipants?: number;
    time?: string; // ISO 8601 date-time string
    enablePositions?: boolean;
}

export interface MatchSummary {
    id: number;
    time: string; // ISO 8601 date-time string
    location: string;
    address: string;
    pricePerMember: number;
    participants: UserSummary[];
    enablePositions?: boolean;
}

export interface ApplyForMatchRequest {
    position?: string | null;
}
