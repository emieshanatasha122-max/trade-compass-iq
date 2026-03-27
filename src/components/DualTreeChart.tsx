import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const REGION_COLORS: Record<string, string> = {
  'AFTA': 'hsla(335, 100%, 48%, 1.00)',
  'EU': 'hsla(335, 100%, 48%, 1.00)',
  'NAFTA': 'hsla(145, 61%, 7%, 1.00)',
  'CHINA': 'hsl(0, 65%, 55%)',
  'WEST ASIA': 'hsl(270, 50%, 55%)',
  'EAST ASIA': 'hsl(187, 65%, 42%)',
  'SOUTH ASIA': 'hsl(340, 60%, 52%)',
  'OCEANIA': 'hsl(100, 45%, 45%)',
  'AFRICA': 'hsl(30, 70%, 48%)',
  'LATIN AMERICA': 'hsl(280, 40%, 55%)',
};

function getRegionColor(region: string, index: number): string {
  for (const [key, color] of Object.entries(REGION_COLORS)) {
    if (region.toUpperCase().includes(key)) return color;
  }
  const fallback = [
    'hsl(207, 70%, 50%)', 'hsl(24, 85%, 55%)', 'hsl(145, 55%, 42%)',
    'hsl(0, 65%, 55%)', 'hsl(270, 50%, 55%)', 'hsl(42, 75%, 50%)',
    'hsl(340, 60%, 52%)', 'hsl(187, 65%, 42%)', 'hsl(100, 45%, 45%)',
    'hsl(30, 70%, 48%)',
  ];
  return fallback[index % fallback.length];
}

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

interface RegionNode {
  name: string;
  total: number;
  states: { name: string; value: number }[];
  color: string;
}

interface Props {
  data: TradeRecord[];
}

function HorizontalTree({ regions, grandTotal, type, lang, onRegionClick }: {
  regions: RegionNode[];
  grandTotal: number;
  type: string;
  lang: string;
  onRegionClick: (r: RegionNode) => void;
}) {
  return (
    <div className="flex items-stretch gap-0 min-h-[320px]">
      {/* Root node */}
      <div className="flex flex-col justify-center pr-2 shrink-0">
        <div className="rounded-lg border border-border bg-card/90 backdrop-blur-sm px-3 py-2 text-center shadow-sm">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {lang === 'bm' ? 'Jumlah' : 'Total'} {type}
          </p>
          <p className="text-sm font-bold text-foreground">{formatRM(grandTotal)}</p>
        </div>
      </div>

      {/* Connector lines */}
      <div className="flex flex-col justify-center w-6 shrink-0">
        <svg width="24" height="100%" viewBox="0 0 24 320" preserveAspectRatio="none" className="h-full">
          {regions.map((_, i) => {
            const y = (i + 0.5) * (320 / regions.length);
            return (
              <path
                key={i}
                d={`M0,160 C12,160 12,${y} 24,${y}`}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
                opacity="0.6"
              />
            );
          })}
        </svg>
      </div>

      {/* Region nodes */}
      <div className="flex flex-col justify-between gap-1.5 flex-1 min-w-0">
        {regions.map((region, i) => {
          const pct = grandTotal > 0 ? (region.total / grandTotal) * 100 : 0;
          return (
            <motion.button
              key={region.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onRegionClick(region)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card/80 backdrop-blur-sm px-2.5 py-1.5 hover:bg-accent/50 transition-colors text-left group min-w-0"
            >
              {/* Color bar */}
              <div
                className="w-1.5 rounded-full shrink-0 self-stretch"
                style={{ backgroundColor: region.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-foreground truncate">
                  {region.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[10px] text-muted-foreground font-medium">{formatRM(region.total)}</p>
                  <span className="text-[9px] text-muted-foreground">({pct.toFixed(1)}%)</span>
                </div>
              </div>
              {/* Mini magnitude bar */}
              <div className="w-16 h-1.5 rounded-full bg-secondary/50 shrink-0">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pct)}%`, backgroundColor: region.color }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function DualTreeChart({ data }: Props) {
  const { lang } = useLanguage();
  const [popup, setPopup] = useState<{ region: string; states: { name: string; value: number }[]; type: string } | null>(null);

  const buildTree = (type: 'Eksport' | 'Import'): { regions: RegionNode[]; grandTotal: number } => {
    const filtered = data.filter(r => r.jenisDagangan === type);
    const regionMap: Record<string, Record<string, number>> = {};

    filtered.forEach(r => {
      const region = r.kawasanEkonomi || 'Others';
      if (!regionMap[region]) regionMap[region] = {};
      regionMap[region][r.negeri] = (regionMap[region][r.negeri] || 0) + r.jumlahDaganganRM;
    });

    const regions = Object.entries(regionMap)
      .map(([region, states], i) => ({
        name: region,
        total: Object.values(states).reduce((a, b) => a + b, 0),
        states: Object.entries(states).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })),
        color: getRegionColor(region, i),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    const grandTotal = regions.reduce((a, b) => a + b.total, 0);
    return { regions, grandTotal };
  };

  const exportTree = useMemo(() => buildTree('Eksport'), [data]);
  const importTree = useMemo(() => buildTree('Import'), [data]);

  const handleRegionClick = (type: string) => (region: RegionNode) => {
    setPopup({
      region: region.name,
      states: region.states.slice(0, 5),
      type,
    });
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Tree */}
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[hsl(0,65%,55%)]" />
            {lang === 'bm' ? 'Import mengikut Kawasan Ekonomi' : 'Import by Economic Region'}
          </h4>
          <HorizontalTree
            regions={importTree.regions}
            grandTotal={importTree.grandTotal}
            type="Import"
            lang={lang}
            onRegionClick={handleRegionClick('Import')}
          />
        </div>

        {/* Export Tree */}
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[hsl(145,55%,42%)]" />
            {lang === 'bm' ? 'Eksport mengikut Kawasan Ekonomi' : 'Export by Economic Region'}
          </h4>
          <HorizontalTree
            regions={exportTree.regions}
            grandTotal={exportTree.grandTotal}
            type={lang === 'bm' ? 'Eksport' : 'Export'}
            lang={lang}
            onRegionClick={handleRegionClick('Export')}
          />
        </div>
      </div>

      {/* Popup for Top States */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-card border border-border rounded-xl shadow-2xl p-4 w-72"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-bold text-foreground">{popup.region}</h5>
              <button onClick={() => setPopup(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">
              Top {lang === 'bm' ? 'Negeri' : 'States'} ({popup.type})
            </p>
            <div className="space-y-2">
              {popup.states.map((s, i) => {
                const maxVal = popup.states[0]?.value || 1;
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                        <span className="text-xs text-foreground">{s.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{formatRM(s.value)}</span>
                    </div>
                    <div className="h-1 rounded-full bg-secondary/50">
                      <div
                        className="h-full rounded-full bg-primary/60 transition-all duration-500"
                        style={{ width: `${(s.value / maxVal) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
