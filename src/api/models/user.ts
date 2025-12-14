/**
 * User Models
 */

export enum ProfileType {
    ADMIN = 'ADMIN',
    GROUP_ADMIN = 'GROUP_ADMIN',
    REGULAR_USER = 'REGULAR_USER',
}

export interface UserSummary {
    id?: number;
    userId?: number;
    name: string;
    position?: string;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    profileType: ProfileType;
}
