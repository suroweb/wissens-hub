/**
 * Deterministic hash-based color assignment for category badges.
 * Maps any category string to a consistent color from a 10-color palette.
 */

export const CATEGORY_COLORS: string[] = [
  '#0078d4', // blue
  '#107c10', // green
  '#d83b01', // orange
  '#5c2d91', // purple
  '#008272', // teal
  '#b4009e', // magenta
  '#e3008c', // pink
  '#004e8c', // dark blue
  '#498205', // olive
  '#986f0b', // gold
];

export function getCategoryColor(category: string): string {
  let hash: number = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash + category.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[index];
}
