/**
 * Token Storage Utilities
 * Handles JWT token storage in localStorage
 */

import { TOKEN_STORAGE_KEY } from '../config';

export const tokenStorage = {
    /**
     * Get the stored JWT token
     */
    getToken: (): string | null => {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    },

    /**
     * Store the JWT token
     */
    setToken: (token: string): void => {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    },

    /**
     * Remove the JWT token
     */
    removeToken: (): void => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    },

    /**
     * Check if a token exists
     */
    hasToken: (): boolean => {
        return !!localStorage.getItem(TOKEN_STORAGE_KEY);
    },
};
