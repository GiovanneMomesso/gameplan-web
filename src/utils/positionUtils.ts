/**
 * Position display-name overrides.
 * Keeps the canonical backend value intact while showing a friendlier label.
 */
const POSITION_DISPLAY_NAMES: Record<string, string> = {
    'Outside hitter': 'Outside',
    'outside hitter': 'Outside',
    'OUTSIDE HITTER': 'Outside',
};

/**
 * Returns the display label for a position name.
 * Falls back to the original value when no override exists.
 */
export function displayPosition(position: string): string {
    return POSITION_DISPLAY_NAMES[position] ?? position;
}
