import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const PALETTE = [
  'hsl(210, 55%, 68%)', 'hsl(170, 50%, 62%)', 'hsl(340, 50%, 70%)',
  'hsl(45, 60%, 65%)', 'hsl(270, 40%, 68%)', 'hsl(140, 45%, 62%)',
  'hsl(200, 55%, 65%)', 'hsl(20, 55%, 65%)', 'hsl(300, 40%, 68%)',
  'hsl(80, 40%, 60%)', 'hsl(0, 45%, 68%)', 'hsl(240, 40%, 68%)',
];

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

function toSentenceCase(str: string): string {
  if (!str) return str;
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function CustomContent({ x = 0, y = 0, width = 0, height = 0, name = '', index = 0, size = 0 }: any) {
  if (width < 45 || height < 32) return null;
  const display = toSentenceCase(name);
  const maxChars = Math.floor(width / 7);
  const truncated = display.length > maxChars ? display.slice(0, Math.max(0, maxChars - 1)) + '…' : display;
  const showValue = width > 80 && height > 50;

  return (
    <g>
      <title>{display}</title>
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
          {lang === 'bm' ? 'Komoditi Perdagangan' : 'Trade Commodities'}
        </h4>
        <span className="text-[10px] text-muted-foreground">
          {lang === 'bm' ? 'Jumlah' : 'Total'}: {formatRM(total)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={420}>
        <Treemap data={treemapData} dataKey="size" nameKey="name" content={<CustomContent />}>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, _name: string, props: any) => {
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              const rawName = props?.payload?.name || '';
              const display = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase() : (lang === 'bm' ? 'Komoditi' : 'Commodity');
              return [`${formatRM(value)} (${pct}%)`, display];
            }}
          />
        </Treemap>
      </ResponsiveContainer>
      {/* Mini legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 px-1">
        {treemapData.slice(0, 6).map((item, i) => {
          const display = item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase();
          return (
            <div key={item.name} className="flex items-center gap-1.5" title={display}>
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
              />
              <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">{display}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}