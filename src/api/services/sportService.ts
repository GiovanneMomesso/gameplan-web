/**
 * Sport Service
 * Handles sport-related operations
 */

import apiClient from '../apiClient';

export const sportService = {
    /**
     * Get available positions for a sport
     * @param sportType Example: 'VOLLEYBALL'
     * @returns Array of available position names
     */
    getPositions: async (sportType: string): Promise<string[]> => {
        const response = await apiClient.get<string[]>(`/api/sports/${sportType}/positions`);
        return response.data;
    },
};
