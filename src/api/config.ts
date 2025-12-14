/**
 * API Configuration
 */

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.143:8080';

export const API_CONFIG = {
    timeout: 30000,
} as const;

export const TOKEN_STORAGE_KEY = 'gameplan_auth_token';
