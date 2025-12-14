/**
 * Error Handling Utilities
 */

import { AxiosError } from 'axios';

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    details?: unknown;
}

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
        return (
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'An unexpected error occurred'
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

/**
 * Type guard for Axios errors
 */
export const isAxiosError = (error: unknown): error is AxiosError<any> => {
    return (error as AxiosError).isAxiosError === true;
};

/**
 * Create a standardized API error object
 */
export const createApiError = (error: unknown): ApiError => {
    if (isAxiosError(error)) {
        return {
            message: getErrorMessage(error),
            status: error.response?.status,
            code: error.code,
            details: error.response?.data,
        };
    }

    return {
        message: getErrorMessage(error),
    };
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
    if (isAxiosError(error)) {
        return error.response?.status === 401 || error.response?.status === 403;
    }
    return false;
};
