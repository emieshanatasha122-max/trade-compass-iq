import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TradeRecord } from '@/data/tradeDataLoader';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// Government-style Blue-Teal-Gold palette
const STATE_COLORS: string[] = [
  'hsl(187, 72%, 42%)', 'hsl(42, 70%, 50%)', 'hsl(170, 50%, 45%)',
  'hsl(220, 50%, 55%)', 'hsl(155, 50%, 40%)', 'hsl(280, 40%, 55%)',
  'hsl(200, 65%, 50%)', 'hsl(340, 50%, 55%)', 'hsl(30, 60%, 50%)',
  'hsl(100, 40%, 45%)', 'hsl(160, 50%, 42%)', 'hsl(50, 65%, 48%)',
  'hsl(210, 55%, 50%)', 'hsl(320, 45%, 50%)', 'hsl(190, 60%, 38%)',
  'hsl(10, 55%, 50%)', 'hsl(240, 40%, 50%)',
];

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

interface Props {
  data: TradeRecord[];
}

export default function StateStackedAreaChart({ data }: Props) {
  const { lang } = useLanguage();

  // Get top states by total value for cleaner chart
  const topStates = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => { map[r.negeri] = (map[r.negeri] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);
  }, [data]);

  // Build time series data
  const { chartData, stateKeys } = useMemo(() => {
    const timeMap: Record<string, Record<string, number>> = {};

    data.forEach(r => {
      const key = `${r.tahun}-${String(r.bulan).padStart(2, '0')}`;
      if (!timeMap[key]) timeMap[key] = {};
      const stateKey = topStates.includes(r.negeri) ? r.negeri : (lang === 'bm' ? 'Lain-lain' : 'Others');
      timeMap[key][stateKey] = (timeMap[key][stateKey] || 0) + r.jumlahDaganganRM;
    });

    const allKeys = [...topStates, lang === 'bm' ? 'Lain-lain' : 'Others'];
    const sorted = Object.entries(timeMap).sort(([a], [b]) => a.localeCompare(b));

    const chartData = sorted.map(([period, vals]) => {
      const entry: Record<string, string | number> = { period };
      let total = 0;
      allKeys.forEach(s => {
        const v = vals[s] || 0;
        entry[s] = v;
        total += v;
      });
      entry['__total'] = total;
      return entry;
    });

    return { chartData, stateKeys: allKeys };
  }, [data, topStates, lang]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0);
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-xl text-xs max-w-xs">
        <p className="font-bold text-foreground mb-2">{label}</p>
        <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
          {payload
            .filter((p: any) => p.value > 0)
            .sort((a: any, b: any) => b.value - a.value)
            .map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-muted-foreground truncate">{p.dataKey}</span>
                </div>
                <span className="font-semibold text-foreground whitespace-nowrap">{formatRM(p.value)}</span>
              </div>
            ))}
        </div>
        <div className="mt-2 pt-2 border-t border-border flex justify-between">
          <span className="font-semibold text-foreground">
            {lang === 'bm' ? 'Jumlah' : 'Total'}
          </span>
          <span className="font-bold text-primary">{formatRM(total)}</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={v => formatRM(v)}
            label={{
              value: lang === 'bm' ? 'Nilai Dagangan (RM)' : 'Trade Value (RM)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' },
              offset: -5,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 10, paddingTop: 12 }}
            iconType="square"
            iconSize={10}
          />
          {stateKeys.map((state, i) => (
            <Area
              key={state}
              type="monotone"
              dataKey={state}
              stackId="1"
              fill={STATE_COLORS[i % STATE_COLORS.length]}
              stroke={STATE_COLORS[i % STATE_COLORS.length]}
              fillOpacity={0.7}
              strokeWidth={1}
              animationDuration={800}
              animationBegin={i * 50}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}