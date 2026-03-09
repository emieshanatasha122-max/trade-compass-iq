import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const COUNTRY_COLORS = [
  'hsl(187, 72%, 42%)', 'hsl(200, 65%, 50%)', 'hsl(170, 50%, 45%)',
  'hsl(220, 50%, 55%)', 'hsl(160, 50%, 42%)', 'hsl(42, 70%, 50%)',
  'hsl(280, 40%, 55%)', 'hsl(340, 50%, 55%)', 'hsl(30, 60%, 50%)',
  'hsl(100, 40%, 45%)',
];

const TREEMAP_COLORS = [
  'hsl(24, 75%, 50%)', 'hsl(340, 55%, 50%)', 'hsl(187, 72%, 42%)',
  'hsl(155, 50%, 40%)', 'hsl(280, 40%, 55%)', 'hsl(42, 70%, 50%)',
  'hsl(200, 65%, 50%)', 'hsl(170, 50%, 45%)', 'hsl(30, 60%, 50%)',
  'hsl(220, 50%, 55%)',
];

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

interface CustomTreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  index?: number;
}

function CustomTreemapContent({ x = 0, y = 0, width = 0, height = 0, name = '', index = 0 }: CustomTreemapContentProps) {
  if (width < 40 || height < 30) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6} fill={TREEMAP_COLORS[index % TREEMAP_COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />
      <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fontSize={width > 80 ? 11 : 9} fontWeight={600} fill="#fff">
        {name && name.length > 15 ? name.slice(0, 15) + '…' : name}
      </text>
    </g>
  );
}

interface Props {
  data: TradeRecord[];
}

export default function TopRankings({ data }: Props) {
  const { t } = useLanguage();
  const [hoveredCountry, setHoveredCountry] = useState<number | null>(null);

  // Top 10 countries (combine export destinations + import origins)
  const top10Countries = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => {
      const country = r.jenisDagangan === 'Eksport' ? r.destinasiEksport : r.negaraAsal;
      if (country && country.trim()) {
        map[country] = (map[country] || 0) + r.jumlahDaganganRM;
      }
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  const maxCountryValue = top10Countries[0]?.value || 1;

  // Top 10 commodities for treemap
  const top10Commodities = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => {
      const name = r.komoditiUtama || 'Other';
      map[name] = (map[name] || 0) + r.jumlahDaganganRM;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, size: value }));
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
      {/* Top 10 Countries - Horizontal Bar */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-4">{t('top10Countries')}</h4>
        <div className="space-y-2">
          {top10Countries.map((country, i) => {
            const widthPct = Math.max((country.value / maxCountryValue) * 100, 3);
            const isHovered = hoveredCountry === i;
            return (
              <motion.div
                key={country.name}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 cursor-default"
                onMouseEnter={() => setHoveredCountry(i)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                <span className={`text-xs font-medium w-24 truncate transition-colors ${isHovered ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {country.name}
                </span>
                <div className="flex-1 h-5 bg-muted/50 rounded overflow-hidden">
                  <motion.div
                    className="h-full rounded"
                    style={{ backgroundColor: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground w-20 text-right">{formatRM(country.value)}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Top 10 Commodities - Treemap */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-4">{t('top10Commodities')}</h4>
        <ResponsiveContainer width="100%" height={320}>
          <Treemap
            data={top10Commodities}
            dataKey="size"
            nameKey="name"
            content={<CustomTreemapContent />}
          >
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [formatRM(value), t('tradeValue')]}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
