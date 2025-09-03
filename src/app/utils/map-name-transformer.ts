/**
 * Transforms a map name from backend format to display format
 * e.g., "watchpoint-gibraltar" -> "Watchpoint Gibraltar"
 */
export function transformMapName(name: string): string {
  if (!name) return '';

  // Split on hyphens and spaces
  return name
    .split(/[-\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
