import React, { useMemo } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  'hsl(220, 55%, 35%)', 'hsl(187, 65%, 42%)', 'hsl(155, 50%, 40%)',
  'hsl(42, 70%, 50%)', 'hsl(340, 55%, 50%)', 'hsl(280, 40%, 55%)',
  'hsl(200, 65%, 50%)', 'hsl(30, 60%, 50%)', 'hsl(170, 50%, 45%)',
  'hsl(100, 40%, 45%)',
];

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

function CustomContent({ x = 0, y = 0, width = 0, height = 0, name = '', index = 0 }: any) {
  if (width < 40 || height < 28) return null;
  const maxChars = Math.floor(width / 7);
  const truncated = name.length > maxChars ? name.slice(0, maxChars) + '…' : name;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4}
        fill={COLORS[index % COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />
      <text x={x + width / 2} y={y + height / 2} textAnchor="middle"
        dominantBaseline="central" fontSize={width > 80 ? 11 : 9} fontWeight={600} fill="#fff">
        {truncated}
      </text>
    </g>
  );
}

interface Props {
  data: TradeRecord[];
}

export default function CommoditySunburst({ data }: Props) {
  const { lang } = useLanguage();

  const treemapData = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => {
      const key = r.komoditiUtama || 'Others';
      map[key] = (map[key] || 0) + r.jumlahDaganganRM;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, size]) => ({ name, size }));
  }, [data]);

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
        {lang === 'bm' ? 'Peta Pokok Komoditi (SITC)' : 'Commodity Treemap (SITC)'}
      </h4>
      <ResponsiveContainer width="100%" height={350}>
        <Treemap data={treemapData} dataKey="size" nameKey="name" content={<CustomContent />}>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, _name: string, props: any) => [
              formatRM(value),
              props?.payload?.name || (lang === 'bm' ? 'Komoditi' : 'Commodity'),
            ]}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
