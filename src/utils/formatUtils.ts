/**
 * Format a number with appropriate suffixes (K, M, B, T, etc.)
 * @param num Number to format
 * @return Formatted string
 */
export function formatNumber(num: number | null | undefined): string {
  // Handle invalid inputs
  if (!num || isNaN(num)) return '0';

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
 * Format data value in bytes to human-readable format (KB, MB, GB, etc.)
 * @param bytes Number of bytes
 * @return Formatted string
 */
export function formatDataValue(bytes: number | null | undefined): string {
  if(!bytes) return '0 B';

  let tier = 0;
  let value = bytes;
  const prefixes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

  while (value >= 1024 && tier < prefixes.length - 1) {
    value /= 1024;
    tier++;
  }

  if (tier === 0) {
    return `${value} ${prefixes[tier]}`;
  } else {
    return `${value.toFixed(2)} ${prefixes[tier]}`;
  }
}

/**
 * Format milliseconds into human-readable time
 * @param ms Time in milliseconds
 * @return Formatted string
 */
export function formatTime(ms: number | null | undefined): string {
  if (!ms) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
