export function timestamp(date: number | Date): number {
  return date instanceof Date ? date.getTime() : date;
}

/** Returns a new array; records and the caller's order are never mutated. */
export function sortByCreatedAt<T extends { createdAt: number | Date }>(records: readonly T[]): T[] {
  return [...records].sort((a, b) => timestamp(a.createdAt) - timestamp(b.createdAt));
}
