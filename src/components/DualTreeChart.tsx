import React, { useMemo, useState } from 'react';
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

interface BranchData {
  regions: RegionNode[];
  grandTotal: number;
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

function Branch({
  label,
  branch,
  branchColor,
  lang,
}: {
  label: string;
  branch: BranchData;
  branchColor: string;
  lang: string;
}) {
  const initialRegion = branch.regions[0]?.name ?? null;
  const [selected, setSelected] = useState<string | null>(initialRegion);

  const activeRegion =
    branch.regions.find(r => r.name === selected) || branch.regions[0] || null;

  return (
    <div className="grid grid-cols-[auto_24px_minmax(0,1fr)_24px_minmax(0,220px)] items-stretch gap-0">
      {/* Branch label */}
      <div className="flex items-center">
        <div
          className="rounded-lg border border-border bg-card/90 px-3 py-2 shadow-sm"
          style={{ borderLeft: `3px solid ${branchColor}` }}
        >
          <p className="text-xs font-bold text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {formatRM(branch.grandTotal)}
          </p>
        </div>
      </div>

      {/* Connector: branch -> regions */}
      <div className="relative">
        <svg
          width="24"
          height="100%"
          viewBox="0 0 24 100"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          {branch.regions.map((_, i) => {
            const total = branch.regions.length;
            const y = ((i + 0.5) / total) * 100;
            return (
              <path
                key={i}
                d={`M0,50 C12,50 12,${y} 24,${y}`}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="1.2"
                opacity="0.7"
              />
            );
          })}
        </svg>
      </div>

      {/* Region boxes */}
      <div className="flex flex-col justify-between gap-2 py-1 min-w-0">
        {branch.regions.length === 0 && (
          <p className="text-[11px] text-muted-foreground italic">
            {lang === 'bm' ? 'Tiada data' : 'No data'}
          </p>
        )}
        {branch.regions.map(region => {
          const pct =
            branch.grandTotal > 0 ? (region.total / branch.grandTotal) * 100 : 0;
          const isActive = activeRegion?.name === region.name;
          return (
            <motion.button
              key={region.name}
              onClick={() => setSelected(region.name)}
              whileHover={{ x: 2 }}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                isActive
                  ? 'border-primary/60 bg-accent/40'
                  : 'border-border bg-card/70 hover:bg-accent/30'
              }`}
            >
              <span
                className="w-1.5 self-stretch rounded-full shrink-0"
                style={{ backgroundColor: REGION_COLORS[region.name] }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-foreground">
                  {region.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {formatRM(region.total)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    ({pct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Connector: active region -> right panel */}
      <div className="relative">
        <svg
          width="24"
          height="100%"
          viewBox="0 0 24 100"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          {activeRegion && branch.regions.length > 0 && (() => {
            const idx = branch.regions.findIndex(r => r.name === activeRegion.name);
            const total = branch.regions.length;
            const y = ((idx + 0.5) / total) * 100;
            return (
              <path
                d={`M0,${y} C12,${y} 12,50 24,50`}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.4"
                opacity="0.7"
              />
            );
          })()}
        </svg>
      </div>

      {/* Top 3 States panel */}
      <div className="flex items-center">
        <div className="w-full rounded-lg border border-border bg-card/80 p-2.5 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
            {lang === 'bm' ? '3 Negeri Teratas' : 'Top 3 States'}
            {activeRegion && (
              <span
                className="ml-1.5 font-bold"
                style={{ color: REGION_COLORS[activeRegion.name] }}
              >
                · {activeRegion.name}
              </span>
            )}
          </p>
          <ul className="space-y-1">
            {(activeRegion?.states.slice(0, 3) ?? []).map((s, i) => {
              const max = activeRegion!.states[0]?.value || 1;
              const w = (s.value / max) * 100;
              return (
                <li key={s.name}>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-muted-foreground font-mono w-3 shrink-0">
                        {i + 1}.
                      </span>
                      <span className="text-foreground truncate">{s.name}</span>
                    </div>
                    <span className="text-muted-foreground font-medium shrink-0">
                      {formatRM(s.value)}
                    </span>
                  </div>
                  <div className="mt-0.5 h-0.5 rounded-full bg-secondary/60">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${w}%`,
                        backgroundColor: REGION_COLORS[activeRegion!.name],
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </li>
              );
            })}
            {(!activeRegion || activeRegion.states.length === 0) && (
              <li className="text-[11px] text-muted-foreground italic">
                {lang === 'bm' ? 'Tiada negeri' : 'No states'}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function DualTreeChart({ data }: Props) {
  const { lang } = useLanguage();

  const buildBranch = (type: 'Eksport' | 'Import'): BranchData => {
    const filtered = data.filter(r => r.jenisDagangan === type);
    const regionMap: Record<string, Record<string, number>> = {};

    filtered.forEach(r => {
      const region = matchRegion(r.kawasanEkonomi);
      if (!region) return;
      if (!regionMap[region]) regionMap[region] = {};
      regionMap[region][r.negeri] =
        (regionMap[region][r.negeri] || 0) + r.jumlahDaganganRM;
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

  const exportBranch = useMemo(() => buildBranch('Eksport'), [data]);
  const importBranch = useMemo(() => buildBranch('Import'), [data]);
  const grandTotal = exportBranch.grandTotal + importBranch.grandTotal;

  const exportLabel = lang === 'bm' ? 'Eksport' : 'Export';
  const importLabel = lang === 'bm' ? 'Import' : 'Import';
  const rootLabel = lang === 'bm' ? 'Kawasan Ekonomi' : 'Economic Region';

  return (
    <div className="grid grid-cols-[auto_28px_minmax(0,1fr)] items-stretch gap-0 min-h-[420px]">
      {/* ROOT */}
      <div className="flex items-center">
        <div className="rounded-xl border border-border bg-card/90 px-4 py-3 shadow-md text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            {rootLabel}
          </p>
          <p className="text-sm font-bold text-foreground mt-0.5">
            {formatRM(grandTotal)}
          </p>
        </div>
      </div>

      {/* Connector: root -> 2 branches */}
      <div className="relative">
        <svg
          width="28"
          height="100%"
          viewBox="0 0 28 100"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M0,50 C14,50 14,25 28,25"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1.4"
            opacity="0.7"
          />
          <path
            d="M0,50 C14,50 14,75 28,75"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1.4"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* Two branches stacked */}
      <div className="flex flex-col gap-6 min-w-0">
        <Branch
          label={exportLabel}
          branch={exportBranch}
          branchColor="hsl(145, 55%, 42%)"
          lang={lang}
        />
        <Branch
          label={importLabel}
          branch={importBranch}
          branchColor="hsl(0, 65%, 55%)"
          lang={lang}
        />
      </div>
    </div>
  );
}
