// Formatting Utilities
// ====================

/**
 * Format a number with appropriate suffixes (K, M, B, T, etc.)
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
    if (num < 1000) {
        if (num < 10) return parseFloat(num.toFixed(2)).toString();
        if (num < 100) return parseFloat(num.toFixed(1)).toString();
        return Math.floor(num).toString();
    }
    
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
    
    if (tier >= suffixes.length) {
        return num.toExponential(2);
    }
    
    const scaled = num / Math.pow(1000, tier);
    const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
    return scaled.toFixed(decimals) + suffixes[tier];
}

/**
 * Format milliseconds into human-readable time
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time string
 */
export function formatTime(ms) {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}
