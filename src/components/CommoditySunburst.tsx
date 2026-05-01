import React, { useEffect, useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateCommodity } from '@/data/commodityTranslations';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const PALETTE = [
  '#7DB7F0',
  '#6FD2C7',
  '#E99ABD',
  '#E7C768',
  '#BBA7E8',
  '#8FD19E',
  '#82C6E8',
  '#E7A77C',
  '#C7A2DD',
  '#B7CF78',
  '#E28F8F',
  '#9FAEE8',
];

const BORDER_PALETTE = [
  '#38BDF8',
  '#22D3EE',
  '#F472B6',
  '#FBBF24',
  '#A78BFA',
  '#4ADE80',
  '#60A5FA',
  '#FB923C',
  '#C084FC',
  '#A3E635',
  '#F87171',
  '#818CF8',
];

const NEON_PALETTE = [
  '#3B82F6', '#34D399', '#FBBF24', '#A78BFA',
  '#F87171', '#22D3EE', '#F472B6', '#4ADE80',
];

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

function CustomContent({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  name = '',
  index = 0,
  size = 0,
  isDark = false,
}: any) {
  if (width < 3 || height < 3) return null;

  const normalColor = PALETTE[index % PALETTE.length];
  const borderColor = BORDER_PALETTE[index % BORDER_PALETTE.length];
  const neonColor = NEON_PALETTE[index % NEON_PALETTE.length];

  const display = name || '';
  const maxChars = Math.max(3, Math.floor(width / 7));
  const truncated =
    display.length > maxChars
      ? display.slice(0, Math.max(0, maxChars - 1)) + '…'
      : display;

  const showLabel = width > 45 && height > 32;
  const showValue = width > 80 && height > 50;

  return (
    <g>
      <defs>
        <linearGradient id={`light-grad-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={normalColor} stopOpacity={1} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.45} />
        </linearGradient>

        {isDark && (
          <>
            <linearGradient id={`dark-grad-${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={neonColor} stopOpacity={1} />
              <stop offset="100%" stopColor={neonColor} stopOpacity={0.25} />
            </linearGradient>

            <filter id={`glow-${index}`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="2"
                floodColor={neonColor}
                floodOpacity="0.35"
              />
            </filter>
          </>
        )}
      </defs>

      <rect
        x={x + 1}
        y={y + 1}
        width={Math.max(0, width - 2)}
        height={Math.max(0, height - 2)}
        rx={6}
        fill={isDark ? `url(#dark-grad-${index})` : `url(#light-grad-${index})`}
        stroke={isDark ? 'rgba(255, 255, 255, 0.6)' : borderColor}
        strokeWidth={isDark ? 1.2 : 1.4}
        filter={isDark ? `url(#glow-${index})` : undefined}
        style={{
          filter: isDark ? undefined : 'drop-shadow(0 2px 8px rgba(15,23,42,0.08))',
        }}
      />

      {showLabel && (
        <text
          x={x + width / 2}
          y={y + (showValue ? height * 0.42 : height / 2)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={width > 100 ? 12 : width > 70 ? 10 : 9}
          fontWeight={800}
          fill={isDark ? '#ffffff' : '#3e2e2eff'}
          style={{
            textShadow: isDark
              ? '0 0 3px rgba(255,255,255,0.35), 0 2px 4px rgba(0,0,0,0.6)'
              : '0 1px 1px rgba(255,255,255,0.9)',
          }}
        >
          {truncated}
        </text>
      )}

      {showValue && size > 0 && formatRM(size) !== 'RM 0' && (
        <text
          x={x + width / 2}
          y={y + height * 0.65}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={600}
          fill={isDark ? 'rgba(255,255,255,0.88)' : '#334155'}
          style={{
            textShadow: isDark
              ? '0 1px 4px rgba(0,0,0,0.65)'
              : '0 1px 1px rgba(255,255,255,0.85)',
          }}
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();

    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => obs.disconnect();
  }, []);

  const treemapData = useMemo(() => {
    const map: Record<string, number> = {};

    data.forEach((r) => {
      const key = r.komoditiUtama || 'Others';
      map[key] = (map[key] || 0) + r.jumlahDaganganRM;
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, size]) => ({
        name: translateCommodity(name, lang),
        size,
      }));
  }, [data, lang]);

  const total = useMemo(
    () => treemapData.reduce((a, b) => a + b.size, 0),
    [treemapData]
  );

  const tooltipStyle = {
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255,255,255,0.95)',
    border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(148,163,184,0.35)',
    borderRadius: '10px',
    fontSize: '11px',
    color: isDark ? '#ffffff' : '#0F172A',
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.45)' : '0 10px 24px rgba(15,23,42,0.12)',
    backdropFilter: 'blur(12px)',
  };

  return (
    <div className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height={460}>
        <Treemap
          data={treemapData}
          dataKey="size"
          nameKey="name"
          content={<CustomContent isDark={isDark} />}
          aspectRatio={1}
          isAnimationActive={false}
        >
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{
              color: isDark ? '#ffffff' : '#0F172A',
            }}
            labelStyle={{
              color: isDark ? '#ffffff' : '#0F172A',
              fontWeight: 600,
            }}
            wrapperStyle={{ outline: 'none', zIndex: 50 }}
            formatter={(value: number, _name: string, props: any) => {
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              const display =
                props?.payload?.name || (lang === 'bm' ? 'Komoditi' : 'Commodity');
              return [`${formatRM(value)} (${pct}%)`, display];
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}