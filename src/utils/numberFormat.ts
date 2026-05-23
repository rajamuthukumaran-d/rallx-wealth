export function formatIndian(raw: string): string {
  const cleaned = raw.replace(/,/g, "");
  const match = cleaned.match(/^(\d*)(\.?\d*)$/);
  if (!match) return raw;

  const intPart = match[1];
  const decPart = match[2];

  if (!intPart) return decPart;

  let result: string;
  if (intPart.length <= 3) {
    result = intPart;
  } else {
    result = intPart.slice(-3);
    let remaining = intPart.slice(0, -3);
    while (remaining.length > 2) {
      result = remaining.slice(-2) + "," + result;
      remaining = remaining.slice(0, -2);
    }
    if (remaining) result = remaining + "," + result;
  }

  return result + decPart;
}

export function parseIndian(value: string): number {
  return parseFloat(value.replace(/,/g, "")) || 0;
}
