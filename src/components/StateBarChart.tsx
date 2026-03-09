import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { Building2, Network } from 'lucide-react';
import { motion } from 'framer-motion';

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
};

const BAR_COLORS = [
  'hsl(187, 72%, 42%)', 'hsl(200, 65%, 50%)', 'hsl(170, 50%, 45%)',
  'hsl(220, 50%, 55%)', 'hsl(160, 50%, 42%)', 'hsl(42, 70%, 50%)',
  'hsl(280, 40%, 55%)', 'hsl(340, 50%, 55%)', 'hsl(30, 60%, 50%)',
  'hsl(100, 40%, 45%)', 'hsl(155, 50%, 40%)', 'hsl(210, 55%, 50%)',
  'hsl(320, 45%, 50%)', 'hsl(50, 65%, 48%)', 'hsl(190, 60%, 38%)',
  'hsl(240, 40%, 50%)', 'hsl(10, 55%, 50%)',
];

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

function FlagOrIcon({ stateName }: { stateName: string }) {
  const [hasError, setHasError] = useState(false);
  const src = STATE_FLAG_FILES[stateName];

  if (stateName === 'Supra') {
    return (
      <div className="w-8 h-5 rounded flex items-center justify-center bg-muted">
        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    );
  }

  if (stateName === 'Agent' || stateName.toLowerCase().includes('agent')) {
    return (
      <div className="w-8 h-5 rounded flex items-center justify-center bg-muted">
        <Network className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    );
  }

  if (!src || hasError) {
    return (
      <div className="w-8 h-5 rounded flex items-center justify-center bg-muted">
        <span className="text-[8px] font-semibold text-muted-foreground">{stateName.slice(0, 3)}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={stateName}
      className="w-8 h-5 object-cover rounded border border-border/50"
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}

interface Props {
  data: TradeRecord[];
}

export default function StateBarChart({ data }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const stateData = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => { map[r.negeri] = (map[r.negeri] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  const maxValue = stateData[0]?.value || 1;

  return (
    <div className="space-y-2">
      {stateData.map((state, i) => {
        const widthPct = Math.max((state.value / maxValue) * 100, 2);
        const isHovered = hoveredIdx === i;
        return (
          <motion.div
            key={state.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 group cursor-default"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <FlagOrIcon stateName={state.name} />
            <span className={`text-xs font-medium w-28 truncate transition-colors ${isHovered ? 'text-foreground' : 'text-muted-foreground'}`}>
              {state.name}
            </span>
            <div className="flex-1 h-7 bg-muted/50 rounded-lg overflow-hidden relative">
              <motion.div
                className="h-full rounded-lg"
                style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.6, delay: i * 0.03, ease: 'easeOut' }}
              />
              {isHovered && (
                <div className="absolute inset-0 flex items-center justify-end pr-3">
                  <span className="text-xs font-bold text-foreground bg-card/80 px-2 py-0.5 rounded">
                    {formatRM(state.value)}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-foreground w-20 text-right">
              {formatRM(state.value)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
