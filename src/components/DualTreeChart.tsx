import React, { useMemo } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const ALLOWED_REGIONS = ['AFTA', 'NAFTA', 'EU'];

const REGION_COLORS: Record<string, string> = {
  AFTA: 'hsl(207, 70%, 50%)',
  NAFTA: 'hsl(270, 50%, 55%)',
  EU: 'hsl(24, 85%, 55%)',
};

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
}

interface Props {
  data: TradeRecord[];
}

function matchRegion(raw: string): string | null {
  const upper = (raw || '').toUpperCase();
  for (const key of ALLOWED_REGIONS) {
    if (upper.includes(key)) return key;
  }
  return null;
}

function RegionList({
  regions,
  grandTotal,
  lang,
  accent,
}: {
  regions: RegionNode[];
  grandTotal: number;
  lang: string;
  accent: string;
}) {
  if (regions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic py-6 text-center">
        {lang === 'bm' ? 'Tiada data tersedia' : 'No data available'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {regions.map((region, i) => {
        const pct = grandTotal > 0 ? (region.total / grandTotal) * 100 : 0;
        return (
          <motion.div
            key={region.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-border bg-card/60 p-3"
          >
            {/* Region header */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: REGION_COLORS[region.name] || accent }}
                />
                <span className="text-sm font-bold text-foreground">{region.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-foreground">{formatRM(region.total)}</span>
                <span className="text-muted-foreground">({pct.toFixed(1)}%)</span>
              </div>
            </div>

            {/* Top 3 states */}
            <ul className="mt-2 space-y-1.5 pl-4">
              {region.states.slice(0, 3).map((s, idx) => (
                <li
                  key={s.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-muted-foreground font-mono w-4 shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-foreground truncate">{s.name}</span>
                  </div>
                  <span className="text-muted-foreground font-medium shrink-0">
                    {formatRM(s.value)}
                  </span>
                </li>
              ))}
              {region.states.length === 0 && (
                <li className="text-xs text-muted-foreground italic">
                  {lang === 'bm' ? 'Tiada negeri' : 'No states'}
                </li>
              )}
            </ul>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function DualTreeChart({ data }: Props) {
  const { lang } = useLanguage();

  const buildTree = (type: 'Eksport' | 'Import'): { regions: RegionNode[]; grandTotal: number } => {
    const filtered = data.filter(r => r.jenisDagangan === type);
    const regionMap: Record<string, Record<string, number>> = {};

    filtered.forEach(r => {
      const region = matchRegion(r.kawasanEkonomi);
      if (!region) return;
      if (!regionMap[region]) regionMap[region] = {};
      regionMap[region][r.negeri] = (regionMap[region][r.negeri] || 0) + r.jumlahDaganganRM;
    });

    const regions: RegionNode[] = ALLOWED_REGIONS
      .filter(name => regionMap[name])
      .map(name => ({
        name,
        total: Object.values(regionMap[name]).reduce((a, b) => a + b, 0),
        states: Object.entries(regionMap[name])
          .sort((a, b) => b[1] - a[1])
          .map(([n, v]) => ({ name: n, value: v })),
      }));

    const grandTotal = regions.reduce((a, b) => a + b.total, 0);
    return { regions, grandTotal };
  };

  const exportTree = useMemo(() => buildTree('Eksport'), [data]);
  const importTree = useMemo(() => buildTree('Import'), [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Export */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[hsl(145,55%,42%)]" />
          {lang === 'bm' ? 'Eksport' : 'Export'}
        </h4>
        <RegionList
          regions={exportTree.regions}
          grandTotal={exportTree.grandTotal}
          lang={lang}
          accent="hsl(145, 55%, 42%)"
        />
      </div>

      {/* Import */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[hsl(0,65%,55%)]" />
          {lang === 'bm' ? 'Import' : 'Import'}
        </h4>
        <RegionList
          regions={importTree.regions}
          grandTotal={importTree.grandTotal}
          lang={lang}
          accent="hsl(0, 65%, 55%)"
        />
      </div>
    </div>
  );
}
