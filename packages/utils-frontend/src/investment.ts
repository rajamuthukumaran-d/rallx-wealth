export function formatUnits(qty: number): string {
  return qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(4);
}
