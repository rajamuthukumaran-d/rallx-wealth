export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getUniqueTypes(items: Array<{ type: string }>): string {
  if (items.length === 0) return "No items yet";
  const unique = [...new Set(items.map((i) => capitalise(i.type)))];
  return unique.slice(0, 3).join(" • ");
}
