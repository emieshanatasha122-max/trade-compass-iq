import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateCommodity } from '@/data/commodityTranslations';
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
  const display = name || '';
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
      .map(([name, size]) => ({ name: translateCommodity(name, lang), size }));
  }, [data, lang]);

  const total = useMemo(() => treemapData.reduce((a, b) => a + b.size, 0), [treemapData]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'hsl(var(--popover-foreground))',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  };

  const tooltipItemStyle = {
    color: 'hsl(var(--popover-foreground))',
  };
  const tooltipLabelStyle = {
    color: 'hsl(var(--popover-foreground))',
    fontWeight: 600,
  };

  return (
    <div className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height={480}>
        <Treemap data={treemapData} dataKey="size" nameKey="name" content={<CustomContent />} aspectRatio={4 / 3}>
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            wrapperStyle={{ outline: 'none', zIndex: 50 }}
            formatter={(value: number, _name: string, props: any) => {
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              const display = props?.payload?.name || (lang === 'bm' ? 'Komoditi' : 'Commodity');
              return [`${formatRM(value)} (${pct}%)`, display];
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}