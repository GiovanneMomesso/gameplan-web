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
    sportType?: 'VOLLEYBALL' | 'BASKETBALL' | null;
    availablePositions?: Record<string, number>;
    enablePositions?: boolean;
    requestPrePayment?: boolean;
    paymentType?: string;
    iban?: string;
    mbwayPhoneNumber?: string;
}

export interface MatchUpdateRequest {
    location?: string;
    address?: string;
    pricePerMember?: number;
    maxParticipants?: number;
    time?: string; // ISO 8601 date-time string
    sportType?: 'VOLLEYBALL' | 'BASKETBALL' | null;
    availablePositions?: Record<string, number>;
    enablePositions?: boolean;
    requestPrePayment?: boolean;
    paymentType?: string;
    iban?: string;
    mbwayPhoneNumber?: string;
}

export interface MatchSummary {
    id: number;
    time: string; // ISO 8601 date-time string
    location: string;
    address: string;
    pricePerMember: number;
    participants: UserSummary[];
    sportType?: 'VOLLEYBALL' | 'BASKETBALL' | null;
    availablePositions?: Record<string, number>;
    enablePositions?: boolean;
    requestPrePayment?: boolean;
    paymentType?: string;
    iban?: string;
    mbwayPhoneNumber?: string;
}

export interface ApplyForMatchRequest {
    position?: string | null;
}

export interface AddGuestRequest {
    name: string;
    position?: string;
}

export interface UpdateTeamPositionRequest {
    position?: string;
    teamName?: string;
}
