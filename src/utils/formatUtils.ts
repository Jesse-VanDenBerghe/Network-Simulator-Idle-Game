/**
 * Format a number with appropriate suffixes (K, M, B, T, etc.)
 */
export function formatNumber(num: number): string {
  // Handle invalid inputs
  if (num === undefined || num === null || isNaN(num)) return '0';
  
  // Convert to number if string
  const n = Number(num);
  if (isNaN(n)) return '0';
  
  if (n < 1000) {
    if (n < 10) return parseFloat(n.toFixed(2)).toString();
    if (n < 100) return parseFloat(n.toFixed(1)).toString();
    return Math.floor(n).toString();
  }

  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const tier = Math.floor(Math.log10(Math.abs(n)) / 3);

  if (tier >= suffixes.length) {
    return n.toExponential(2);
  }

  const scaled = n / Math.pow(1000, tier);
  const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  return scaled.toFixed(decimals) + suffixes[tier];
}

/**
 * Format milliseconds into human-readable time
 */
export function formatTime(ms: number): string {
  if (!ms) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
