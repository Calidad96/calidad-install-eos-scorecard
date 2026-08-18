const TONE_CLASS = {
  good: 'status-good',
  warn: 'status-warn',
  bad: 'status-bad',
  royal: 'status-royal',
  neutral: 'status-neutral',
} as const;

export function StatusTag({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: keyof typeof TONE_CLASS;
}) {
  return <span className={`status-tag ${TONE_CLASS[tone]}`}>{label || '—'}</span>;
}

export function priorityTone(priority: string): keyof typeof TONE_CLASS {
  const p = priority.toLowerCase();
  if (p.includes('critical')) return 'bad';
  if (p.includes('high')) return 'warn';
  return 'neutral';
}

export function statusTone(status: string): keyof typeof TONE_CLASS {
  const s = status.toLowerCase();
  if (/done|complete|closed|finalized|on track/.test(s)) return 'good';
  if (/progress|working|review|not reported/.test(s)) return 'warn';
  if (/overdue|not started|off track|blocked/.test(s)) return 'bad';
  return 'neutral';
}

export function offTrackTone(offTrack: string): keyof typeof TONE_CLASS {
  const s = offTrack.toLowerCase();
  if (s.includes('on track')) return 'good';
  if (s.includes('off track')) return 'bad';
  return 'warn';
}
