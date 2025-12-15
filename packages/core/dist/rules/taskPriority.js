/**
 * Ordre métier des priorités
 */
export const PRIORITY_ORDER = {
    low: 1,
    medium: 2,
    high: 3,
};
/**
 * Compare deux priorités
 * > 0  => a plus prioritaire que b
 * < 0  => b plus prioritaire que a
 */
export function comparePriority(a, b) {
    return PRIORITY_ORDER[a] - PRIORITY_ORDER[b];
}
/**
 * Retourne la priorité la plus élevée
 */
export function maxPriority(a, b) {
    return comparePriority(a, b) >= 0 ? a : b;
}
