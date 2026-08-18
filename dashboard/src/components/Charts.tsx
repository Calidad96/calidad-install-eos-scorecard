'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3ddc91', '#f3b14e', '#ff6b6b', '#2e75b6', '#d4a853', '#8294b6'];

export function DonutChart({
  data,
  centerLabel,
  centerValue,
}: {
  data: { name: string; value: number }[];
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const filtered = data.filter((d) => d.value > 0);
  if (!filtered.length) {
    return (
      <div className="flex h-[180px] items-center justify-center text-[13px] text-[var(--muted)]">
        No data
      </div>
    );
  }

  return (
    <div className="relative h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
          >
            {filtered.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue != null) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue != null && (
            <span className="font-display text-[28px] font-extrabold tabular-nums text-[var(--ink)]">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function BarChartSimple({
  data,
  color = 'var(--royal)',
}: {
  data: { name: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.name}>
          <div className="mb-1 flex justify-between text-[12px]">
            <span className="truncate pr-2 text-[var(--muted)]">{d.name}</span>
            <span className="shrink-0 font-bold tabular-nums text-[var(--ink)]">{d.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--hover-row)]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value / max) * 100}%`, background: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusLegend({ items }: { items: { name: string; value: number; color?: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
      {items
        .filter((i) => i.value > 0)
        .map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2 text-[11px]">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: item.color ?? COLORS[idx % COLORS.length] }}
            />
            <span className="text-[var(--muted)]">{item.name}</span>
            <span className="font-bold tabular-nums text-[var(--ink)]">{item.value}</span>
          </div>
        ))}
    </div>
  );
}
