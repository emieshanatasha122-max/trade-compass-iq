import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TradeRecord } from '@/data/mockTradeData';
import { motion } from 'framer-motion';

// State flag colors for SVG placeholders (based on actual Malaysian state flag dominant colors)
const STATE_FLAGS: Record<string, { colors: string[]; abbr: string }> = {
  'Selangor': { colors: ['#FFD700', '#CE1126'], abbr: 'SEL' },
  'Johor': { colors: ['#CE1126', '#003DA5'], abbr: 'JHR' },
  'Pulau Pinang': { colors: ['#003DA5', '#FFD700'], abbr: 'PNG' },
  'Sarawak': { colors: ['#CE1126', '#FFD700', '#000000'], abbr: 'SWK' },
  'Sabah': { colors: ['#003DA5', '#CE1126', '#FFFFFF'], abbr: 'SBH' },
  'Perak': { colors: ['#FFFFFF', '#FFD700', '#000000'], abbr: 'PRK' },
  'Kedah': { colors: ['#CE1126', '#FFD700'], abbr: 'KDH' },
  'Pahang': { colors: ['#FFFFFF', '#000000'], abbr: 'PHG' },
  'Kelantan': { colors: ['#CE1126', '#FFFFFF'], abbr: 'KTN' },
  'Terengganu': { colors: ['#FFFFFF', '#000000'], abbr: 'TRG' },
  'Melaka': { colors: ['#003DA5', '#FFD700'], abbr: 'MLK' },
  'Negeri Sembilan': { colors: ['#FFD700', '#000000'], abbr: 'N9' },
  'Perlis': { colors: ['#003DA5', '#FFD700'], abbr: 'PLS' },
  'W.P. Kuala Lumpur': { colors: ['#003DA5', '#CE1126'], abbr: 'KL' },
  'W.P. Labuan': { colors: ['#003DA5', '#CE1126', '#FFD700'], abbr: 'LBN' },
  'Supra': { colors: ['#6B7280', '#9CA3AF'], abbr: 'SUP' },
};

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

function StateFlagSVG({ colors, abbr }: { colors: string[]; abbr: string }) {
  const stripeCount = colors.length;
  const stripeHeight = 60 / stripeCount;

  return (
    <svg viewBox="0 0 90 60" className="w-full h-full state-flag-wave" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id={`wave-${abbr}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.08" numOctaves="3" seed="2" result="noise">
            <animate attributeName="baseFrequency" values="0.015 0.08;0.02 0.1;0.015 0.08" dur="4s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#wave-${abbr})`}>
        {colors.map((color, i) => (
          <rect key={i} x={0} y={i * stripeHeight} width={90} height={stripeHeight} fill={color} />
        ))}
      </g>
      <rect x={0} y={0} width={90} height={60} fill="none" stroke="hsl(var(--border))" strokeWidth={0.5} rx={2} />
    </svg>
  );
}

interface Props {
  data: TradeRecord[];
}

export default function StateFlagGrid({ data }: Props) {
  const { lang } = useLanguage();
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const stateData = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => { map[r.negeri] = (map[r.negeri] || 0) + r.jumlahDaganganRM; });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        pct: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
      }));
  }, [data]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {stateData.map((state, i) => {
        const flag = STATE_FLAGS[state.name] || { colors: ['#6B7280', '#9CA3AF'], abbr: '?' };
        const isHovered = hoveredState === state.name;

        return (
          <motion.div
            key={state.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onMouseEnter={() => setHoveredState(state.name)}
            onMouseLeave={() => setHoveredState(null)}
            className="group relative rounded-xl border border-border bg-card p-3 cursor-default transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
          >
            {/* Flag */}
            <div className="w-full aspect-[3/2] rounded-lg overflow-hidden mb-2.5">
              <StateFlagSVG colors={flag.colors} abbr={flag.abbr} />
            </div>

            {/* State name */}
            <p className="text-xs font-semibold text-foreground truncate">{state.name}</p>

            {/* Trade value */}
            <p className="text-sm font-bold text-primary mt-0.5">{formatRM(state.value)}</p>

            {/* Hover overlay with percentage */}
            <div className={`absolute inset-0 rounded-xl bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <p className="text-xs font-semibold text-foreground">{state.name}</p>
              <p className="text-lg font-bold text-primary mt-1">{state.pct}%</p>
              <p className="text-[10px] text-muted-foreground">
                {lang === 'bm' ? 'Sumbangan Dagangan Nasional' : 'Share of National Trade'}
              </p>
              <p className="text-xs font-semibold text-foreground mt-1">{formatRM(state.value)}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
