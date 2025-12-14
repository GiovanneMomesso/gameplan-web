/**
 * Authentication Models
 */

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface UserCreateRequest {
    name: string;
    email: string;
    password: string;
}
