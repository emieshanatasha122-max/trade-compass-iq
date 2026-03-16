import React, { useMemo } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';

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

export default function TopCountryBars({ data }: Props) {
  const { lang } = useLanguage();

  const { top10Export, top10Import } = useMemo(() => {
    const expMap: Record<string, number> = {};
    const impMap: Record<string, number> = {};

    data.forEach(r => {
      if (r.jenisDagangan === 'Eksport') {
        const c = r.destinasiEksport || 'Unknown';
        expMap[c] = (expMap[c] || 0) + r.jumlahDaganganRM;
      } else {
        const c = r.negaraAsal || 'Unknown';
        impMap[c] = (impMap[c] || 0) + r.jumlahDaganganRM;
      }
    });

    return {
      top10Export: Object.entries(expMap).sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + '…' : name, value })),
      top10Import: Object.entries(impMap).sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + '…' : name, value })),
    };
  }, [data]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'hsl(var(--foreground))',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 10 Import - Horizontal Bar */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3">
          {lang === 'bm' ? '10 Negara Import Teratas' : 'Top 10 Import Countries'}
        </h4>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={top10Import} layout="vertical" margin={{ left: 5, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatRM(v)} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={100} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatRM(v), 'Import']} />
            <Bar dataKey="value" fill="hsl(42, 70%, 50%)" radius={[0, 4, 4, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 Export - Vertical Bar */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3">
          {lang === 'bm' ? '10 Negara Eksport Teratas' : 'Top 10 Export Countries'}
        </h4>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={top10Export} margin={{ left: 5, right: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} angle={-45} textAnchor="end" />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatRM(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatRM(v), 'Export']} />
            <Bar dataKey="value" fill="hsl(187, 72%, 42%)" radius={[4, 4, 0, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
