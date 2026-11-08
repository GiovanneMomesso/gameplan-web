/**
 * Date formatting utilities
 */

/**
 * Check if a date string is valid
 */
const isValidDate = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

/**
 * Format ISO date string to readable date and time
 */
export const formatDateTime = (isoString: string | null | undefined): string => {
    if (!isValidDate(isoString)) {
        return 'Date not set';
    }

    const date = new Date(isoString!);
    return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Format ISO date string to readable date only
 */
export const formatDate = (isoString: string | null | undefined): string => {
    if (!isValidDate(isoString)) {
        return 'Date not set';
    }

    const date = new Date(isoString!);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format ISO date string to time only
 */
export const formatTime = (isoString: string | null | undefined): string => {
    if (!isValidDate(isoString)) {
        return 'Time not set';
    }

    const date = new Date(isoString!);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Convert date to ISO string for API
 */
export const toISOString = (date: Date): string => {
    return date.toISOString();
};

/**
 * Get days remaining relative to current date
 * Returns a formatted string (e.g. "(in 5 days)") or null if passed
 */
export const getDaysRemaining = (isoString: string | null | undefined): string | null => {
    if (!isValidDate(isoString)) return null;

    const matchDate = new Date(isoString!);
    const now = new Date();

    // Reset hours to compare dates only for day calculation
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null;
    if (diffDays === 0) return '(Today)';
    if (diffDays === 1) return '(Tomorrow)';
    return `(in ${diffDays} days)`;
};
