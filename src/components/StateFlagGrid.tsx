import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TradeRecord } from '@/data/mockTradeData';
import { motion } from 'framer-motion';

// Map state names to their official flag file paths in public/flags/
const STATE_FLAG_FILES: Record<string, string> = {
  'Selangor': '/flags/Selangor.svg',
  'Johor': '/flags/Johor.svg',
  'Pulau Pinang': '/flags/Pulau_Pinang.svg',
  'Sarawak': '/flags/Sarawak.svg',
  'Sabah': '/flags/Sabah.svg',
  'Perak': '/flags/Perak.svg',
  'Kedah': '/flags/Kedah.svg',
  'Pahang': '/flags/Pahang.svg',
  'Kelantan': '/flags/Kelantan.svg',
  'Terengganu': '/flags/Terengganu.svg',
  'Melaka': '/flags/Melaka.svg',
  'Negeri Sembilan': '/flags/Negeri_Sembilan.svg',
  'Perlis': '/flags/Perlis.svg',
  'W.P. Kuala Lumpur': '/flags/WP_Kuala_Lumpur.svg',
  'W.P. Labuan': '/flags/WP_Labuan.svg',
  'Supra': '/flags/Supra.svg',
};

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

function FlagImage({ stateName }: { stateName: string }) {
  const [hasError, setHasError] = useState(false);
  const src = STATE_FLAG_FILES[stateName];

  if (!src || hasError) {
    // Text fallback
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <span className="text-xs font-semibold text-muted-foreground">{stateName}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Flag of ${stateName}`}
      className="w-full h-full object-cover flag-wave"
      onError={() => setHasError(true)}
      loading="lazy"
    />
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {stateData.map((state, i) => {
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
            {/* Official Flag */}
            <div className="w-full aspect-[3/2] rounded-lg overflow-hidden mb-3 border border-border/50">
              <FlagImage stateName={state.name} />
            </div>

            {/* State name - centered */}
            <p className="text-xs font-medium text-muted-foreground text-center truncate">{state.name}</p>

            {/* Trade value - centered, large, bold */}
            <p className="text-base font-bold text-primary text-center mt-0.5">{formatRM(state.value)}</p>

            {/* Hover overlay with percentage */}
            <div className={`absolute inset-0 rounded-xl bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <p className="text-sm font-semibold text-foreground">{state.name}</p>
              <p className="text-2xl font-bold text-primary mt-1">{state.pct}%</p>
              <p className="text-[10px] text-muted-foreground">
                {lang === 'bm' ? 'Sumbangan Dagangan Nasional' : 'Share of National Trade'}
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">{formatRM(state.value)}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
