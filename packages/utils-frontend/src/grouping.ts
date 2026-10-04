/** Group records for display without depending on a platform's database models. */
export function groupByType<T extends { type: string }>(items: readonly T[]): [string, T[]][] {
  const groups: Record<string, T[]> = Object.create(null);
  for (const item of items) {
    (groups[item.type] ??= []).push(item);
  }
  return Object.entries(groups);
}

/** Symbols are case-insensitive; records without a symbol remain separate. */
export function groupBySymbol<T extends { id: string; symbol?: string | null }>(items: readonly T[]): [string, T[]][] {
  const groups: Record<string, T[]> = Object.create(null);
  for (const item of items) {
    const key = item.symbol ? item.symbol.toUpperCase() : `__solo__${item.id}`;
    (groups[key] ??= []).push(item);
  }
  return Object.entries(groups);
}
