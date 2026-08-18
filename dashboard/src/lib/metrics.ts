export function computeScore(
  actual: number | null,
  target: number | null,
  goalDirection: string
): number | null {
  if (actual == null || target == null) return null;
  if (actual === target) return 5;
  const dir = goalDirection?.toLowerCase() ?? '';
  if (dir.includes('low') && target === 0) return actual <= 0 ? 5 : 0;
  if (dir.includes('low') && actual === 0) return 5;
  const ratio = dir.includes('high') ? actual / target : target / actual;
  return Math.max(0, Math.min(5, ratio * 5));
}

export function scoreColor(score: number | null): string {
  if (score == null) return '#8294b6';
  if (score >= 4) return '#3ddc91';
  if (score >= 2.5) return '#f3b14e';
  return '#ff6b6b';
}
