/**
 * Sport Hooks
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { sportService } from '../services';
import { ApiError } from '../utils/errorHandler';

export const sportKeys = {
    all: ['sports'] as const,
    positions: (sportType: string) => [...sportKeys.all, sportType, 'positions'] as const,
};

/**
 * Hook to get available positions for a given sport
 */
export const useSportPositions = (sportType?: string | null): UseQueryResult<string[], ApiError> => {
    return useQuery({
        queryKey: sportKeys.positions(sportType || ''),
        queryFn: () => sportService.getPositions(sportType!),
        enabled: !!sportType,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
    });
};
