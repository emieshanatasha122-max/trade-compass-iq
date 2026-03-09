import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TradeRecord } from '@/data/tradeDataLoader';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// Tableau10-inspired high-contrast palette
const COMMODITY_COLORS: string[] = [
  'hsl(207, 70%, 50%)',  // Steel Blue
  'hsl(24, 85%, 55%)',   // Orange
  'hsl(145, 55%, 42%)',  // Green
  'hsl(0, 65%, 55%)',    // Red
  'hsl(270, 50%, 55%)',  // Purple
  'hsl(42, 75%, 50%)',   // Gold
  'hsl(340, 60%, 52%)',  // Pink
  'hsl(187, 65%, 42%)',  // Teal
  'hsl(100, 45%, 45%)',  // Olive
  'hsl(30, 70%, 48%)',   // Brown
  'hsl(220, 55%, 58%)',  // Periwinkle
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

export default function CommodityStackedAreaChart({ data }: Props) {
  const { lang } = useLanguage();

  // Get top commodities by total value
  const topCommodities = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => {
      const name = r.komoditiUtama || (lang === 'bm' ? 'Lain-lain' : 'Others');
      map[name] = (map[name] || 0) + r.jumlahDaganganRM;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);
  }, [data, lang]);

  // Build time series data
  const { chartData, commodityKeys } = useMemo(() => {
    const timeMap: Record<string, Record<string, number>> = {};
    const othersLabel = lang === 'bm' ? 'Lain-lain' : 'Others';

    data.forEach(r => {
      const key = `${r.tahun}-${String(r.bulan).padStart(2, '0')}`;
      if (!timeMap[key]) timeMap[key] = {};
      const commodityKey = topCommodities.includes(r.komoditiUtama) ? r.komoditiUtama : othersLabel;
      timeMap[key][commodityKey] = (timeMap[key][commodityKey] || 0) + r.jumlahDaganganRM;
    });

    const allKeys = [...topCommodities, othersLabel];
    const sorted = Object.entries(timeMap).sort(([a], [b]) => a.localeCompare(b));

    const chartData = sorted.map(([period, vals]) => {
      const entry: Record<string, string | number> = { period };
      allKeys.forEach(c => {
        entry[c] = vals[c] || 0;
      });
      return entry;
    });

    return { chartData, commodityKeys: allKeys };
  }, [data, topCommodities, lang]);

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
                  <span className="text-muted-foreground truncate max-w-[160px]">{p.dataKey}</span>
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
          {commodityKeys.map((commodity, i) => (
            <Area
              key={commodity}
              type="monotone"
              dataKey={commodity}
              stackId="1"
              fill={COMMODITY_COLORS[i % COMMODITY_COLORS.length]}
              stroke={COMMODITY_COLORS[i % COMMODITY_COLORS.length]}
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
