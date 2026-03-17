import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const PALETTE = [
  'hsl(220, 55%, 40%)', 'hsl(187, 65%, 42%)', 'hsl(155, 50%, 40%)',
  'hsl(42, 70%, 50%)', 'hsl(340, 55%, 50%)', 'hsl(280, 40%, 50%)',
  'hsl(200, 65%, 45%)', 'hsl(30, 60%, 45%)', 'hsl(170, 50%, 40%)',
  'hsl(100, 40%, 42%)', 'hsl(0, 55%, 48%)', 'hsl(260, 45%, 48%)',
];

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

function CustomContent({ x = 0, y = 0, width = 0, height = 0, name = '', index = 0, size = 0 }: any) {
  if (width < 45 || height < 32) return null;
  const maxChars = Math.floor(width / 7);
  const truncated = name.length > maxChars ? name.slice(0, maxChars) + '…' : name;
  const showValue = width > 80 && height > 50;

  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height} rx={6}
        fill={PALETTE[index % PALETTE.length]}
        stroke="hsl(var(--card))" strokeWidth={2}
      />
      <text
        x={x + width / 2} y={y + (showValue ? height * 0.4 : height / 2)}
        textAnchor="middle" dominantBaseline="central"
        fontSize={width > 100 ? 12 : width > 70 ? 10 : 9}
        fontWeight={700} fill="#fff" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
      >
        {truncated}
      </text>
      {showValue && (
        <text
          x={x + width / 2} y={y + height * 0.65}
          textAnchor="middle" dominantBaseline="central"
          fontSize={9} fontWeight={500} fill="rgba(255,255,255,0.75)"
        >
          {formatRM(size)}
        </text>
      )}
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

  const total = useMemo(() => treemapData.reduce((a, b) => a + b.size, 0), [treemapData]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'hsl(var(--foreground))',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-foreground">
          {lang === 'bm' ? 'Peta Pokok Komoditi (SITC)' : 'Commodity Treemap (SITC)'}
        </h4>
        <span className="text-[10px] text-muted-foreground">
          {lang === 'bm' ? 'Jumlah' : 'Total'}: {formatRM(total)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <Treemap data={treemapData} dataKey="size" nameKey="name" content={<CustomContent />}>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, _name: string, props: any) => {
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return [
                `${formatRM(value)} (${pct}%)`,
                props?.payload?.name || (lang === 'bm' ? 'Komoditi' : 'Commodity'),
              ];
            }}
          />
        </Treemap>
      </ResponsiveContainer>
      {/* Mini legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 px-1">
        {treemapData.slice(0, 6).map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
