import React, { useMemo } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage, ENTERPRISE_LABEL_MAP } from '@/contexts/LanguageContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = [
  'hsl(210, 55%, 68%)',
  'hsl(170, 50%, 62%)',
  'hsl(340, 50%, 70%)',
  'hsl(45, 60%, 65%)',
  'hsl(270, 40%, 68%)',
];

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

interface Props {
  data: TradeRecord[];
}

export default function EnterpriseDonut({ data }: Props) {
  const { lang } = useLanguage();

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => {
      const key = r.keluasanSyarikat || 'Unknown';
      map[key] = (map[key] || 0) + r.jumlahDaganganRM;
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name: ENTERPRISE_LABEL_MAP[name]?.[lang] || name,
        value,
        pct: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
      }));
  }, [data, lang]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'hsl(var(--foreground))',
  };

  return (
    <div>
      <h4 className="text-sm font-bold text-foreground mb-3">
        {lang === 'bm' ? 'Saiz Syarikat' : 'Company Size'}
      </h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={45}
            dataKey="value"
            nameKey="name"
            label={({ name, pct }) => `${name} (${pct}%)`}
            labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [formatRM(value), lang === 'bm' ? 'Nilai' : 'Value']}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px' }}
            formatter={(value: string) => <span className="text-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
