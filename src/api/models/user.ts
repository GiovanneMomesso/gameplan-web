/**
 * User Models
 */

export enum ProfileType {
    ADMIN = 'ADMIN',
    GROUP_ADMIN = 'GROUP_ADMIN',
    REGULAR_USER = 'REGULAR_USER',
}

export enum ParticipantStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REFUSED = 'REFUSED',
}

export interface UserSummary {
    id?: number;
    userId?: number;
    participantId?: number;
    name: string;
    position?: string;
    teamName?: string;
    status?: ParticipantStatus;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    profileType: ProfileType;
}

export interface UserUpdateRequest {
    name: string;
}
