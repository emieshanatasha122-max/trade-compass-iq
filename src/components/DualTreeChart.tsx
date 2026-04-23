import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const REGIONS = ['AFTA', 'NAFTA', 'EU'] as const;
type RegionKey = (typeof REGIONS)[number];
type Mode = 'export' | 'import';

const REGION_DISPLAY: Record<RegionKey, string> = {
  AFTA: 'A.F.T.A',
  NAFTA: 'N.A.F.T.A',
  EU: 'E.U.',
};

const REGION_THEME: Record<
  RegionKey,
  {
    color: string;
    border: string;
    subtleBg: string;
  }
> = {
  AFTA: {
    color: 'hsl(188, 85%, 52%)',
    border: 'border-cyan-400/30',
    subtleBg: 'bg-cyan-500/6 dark:bg-cyan-400/8',
  },
  NAFTA: {
    color: 'hsl(268, 78%, 64%)',
    border: 'border-violet-400/30',
    subtleBg: 'bg-violet-500/6 dark:bg-violet-400/8',
  },
  EU: {
    color: 'hsl(28, 92%, 58%)',
    border: 'border-orange-400/30',
    subtleBg: 'bg-orange-500/6 dark:bg-orange-400/8',
  },
};

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

function normalizeText(raw: string): string {
  return (raw || '').trim().toUpperCase();
}

function matchRegion(raw: string): RegionKey | null {
  const upper = normalizeText(raw);

  if (
    upper.includes('AFTA') ||
    upper.includes('ASEAN FREE TRADE AREA') ||
    upper === 'ASEAN'
  ) {
    return 'AFTA';
  }

  if (
    upper.includes('NAFTA') ||
    upper.includes('USMCA') ||
    upper.includes('NORTH AMERICAN FREE TRADE')
  ) {
    return 'NAFTA';
  }

  if (
    upper === 'EU' ||
    upper.includes('E.U') ||
    upper.includes('EUROPEAN UNION')
  ) {
    return 'EU';
  }

  return null;
}

interface RegionState {
  name: string;
  value: number;
}

interface RegionCardData {
  region: RegionKey;
  exportValue: number;
  importValue: number;
  totalValue: number;
  statesExport: RegionState[];
  statesImport: RegionState[];
  statesTotal: RegionState[];
}

interface Props {
  data: TradeRecord[];
}

function RegionCard({
  item,
  mode,
  lang,
  grandTotal,
  expanded,
  onToggle,
}: {
  item: RegionCardData;
  mode: Mode;
  lang: string;
  grandTotal: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const theme = REGION_THEME[item.region];
  const value = mode === 'export' ? item.exportValue : item.importValue;
  const states = mode === 'export' ? item.statesExport : item.statesImport;
  const pct = grandTotal > 0 ? (value / grandTotal) * 100 : 0;
  const topStates = states.slice(0, 3);

  return (
    <motion.div
      layout
      className={`overflow-hidden rounded-xl border bg-card/80 backdrop-blur-sm ${theme.border}`}
      style={{
        boxShadow: expanded
          ? `0 0 0 1px ${theme.color}16, 0 6px 18px rgba(0,0,0,0.08)`
          : undefined,
      }}
    >
      <button
        onClick={onToggle}
        className={`w-full px-3 py-2 text-left transition-colors hover:bg-white/[0.02] ${theme.subtleBg}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="min-w-0">
              <p
                className="text-[15px] font-bold tracking-[0.16em]"
                style={{ color: theme.color }}
              >
                {REGION_DISPLAY[item.region]}
              </p>

              <p className="mt-1 text-[14px] font-extrabold text-foreground">
                {formatRM(value)}
              </p>

              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {lang === 'bm' ? 'Peratus bahagian' : 'Share of total'}: {pct.toFixed(1)}%
              </p>
            </div>

            <div className="mt-2">
              <div className="h-1 rounded-full bg-secondary/60">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: theme.color,
                    opacity: 0.95,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-background/60 p-1.5">
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-foreground" />
            )}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-3 pb-3 pt-2">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {lang === 'bm' ? '3 Negeri Teratas' : 'Top 3 States'}
              </p>

              {topStates.length > 0 ? (
                <div className="space-y-2">
                  {topStates.map((state, index) => {
                    const max = topStates[0]?.value || 1;
                    const width = (state.value / max) * 100;

                    return (
                      <div
                        key={state.name}
                        className="rounded-lg border border-border/70 bg-background/35 px-2.5 py-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="w-4 shrink-0 text-[10px] font-mono text-muted-foreground">
                              {index + 1}.
                            </span>
                            <span className="truncate text-[13px] font-medium text-foreground">
                              {state.name}
                            </span>
                          </div>

                          <span className="shrink-0 text-[13px] font-semibold text-foreground">
                            {formatRM(state.value)}
                          </span>
                        </div>

                        <div className="mt-1.5 h-1 rounded-full bg-secondary/60">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${width}%`,
                              backgroundColor: theme.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border px-2.5 py-2 text-[12px] italic text-muted-foreground">
                  {lang === 'bm' ? 'Tiada negeri direkodkan' : 'No states recorded'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DualTreeChart({ data }: Props) {
  const { lang } = useLanguage();
  const [mode, setMode] = useState<Mode>('export');
  const [openRegion, setOpenRegion] = useState<RegionKey | null>(null);

  const chartData = useMemo<RegionCardData[]>(() => {
    const exportRegionMap: Record<string, Record<string, number>> = {};
    const importRegionMap: Record<string, Record<string, number>> = {};

    data.forEach((r) => {
      const region = matchRegion(r.kawasanEkonomi);
      if (!region) return;

      const stateName = r.negeri || (lang === 'bm' ? 'Tidak Diketahui' : 'Unknown');

      if (r.jenisDagangan === 'Eksport') {
        if (!exportRegionMap[region]) exportRegionMap[region] = {};
        exportRegionMap[region][stateName] =
          (exportRegionMap[region][stateName] || 0) + r.jumlahDaganganRM;
      } else {
        if (!importRegionMap[region]) importRegionMap[region] = {};
        importRegionMap[region][stateName] =
          (importRegionMap[region][stateName] || 0) + r.jumlahDaganganRM;
      }
    });

    return REGIONS.map((region) => {
      const exportStatesMap = exportRegionMap[region] || {};
      const importStatesMap = importRegionMap[region] || {};

      const statesExport = Object.entries(exportStatesMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));

      const statesImport = Object.entries(importStatesMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));

      const totalStateMap: Record<string, number> = {};

      [...statesExport, ...statesImport].forEach((state) => {
        totalStateMap[state.name] = (totalStateMap[state.name] || 0) + state.value;
      });

      const statesTotal = Object.entries(totalStateMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));

      const exportValue = statesExport.reduce((a, b) => a + b.value, 0);
      const importValue = statesImport.reduce((a, b) => a + b.value, 0);
      const totalValue = exportValue + importValue;

      return {
        region,
        exportValue,
        importValue,
        totalValue,
        statesExport,
        statesImport,
        statesTotal,
      };
    });
  }, [data, lang]);

  const grandTotal = chartData.reduce((sum, item) => {
    return sum + (mode === 'export' ? item.exportValue : item.importValue);
  }, 0);

  const sectionTitle =
    mode === 'export'
      ? lang === 'bm'
        ? 'Eksport'
        : 'Export'
      : lang === 'bm'
      ? 'Import'
      : 'Import';

  const sectionDescription =
    mode === 'export'
      ? lang === 'bm'
        ? 'Paparan kawasan ekonomi berdasarkan nilai eksport.'
        : 'Economic region view based on export value.'
      : lang === 'bm'
      ? 'Paparan kawasan ekonomi berdasarkan nilai import.'
      : 'Economic region view based on import value.';

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card/70 p-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {lang === 'bm' ? 'Kawasan Ekonomi' : 'Economic Region'}
          </p>

          <h3 className="mt-1 text-[16px] font-extrabold text-foreground">
            {formatRM(grandTotal)}
          </h3>

          <p className="mt-1 text-[11px] text-muted-foreground">
            {sectionDescription}
          </p>
        </div>

        <div className="inline-flex w-fit rounded-xl border border-border bg-background/50 p-1">
          <button
            onClick={() => setMode('export')}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
              mode === 'export'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {lang === 'bm' ? 'Eksport' : 'Export'}
          </button>

          <button
            onClick={() => setMode('import')}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
              mode === 'import'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {lang === 'bm' ? 'Import' : 'Import'}
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-foreground">
          {lang === 'bm' ? `Paparan ${sectionTitle}` : `${sectionTitle} View`}
        </h4>
      </div>

      <div className="space-y-3">
        {chartData.map((item) => (
          <RegionCard
            key={item.region}
            item={item}
            mode={mode}
            lang={lang}
            grandTotal={grandTotal}
            expanded={openRegion === item.region}
            onToggle={() =>
              setOpenRegion((prev) => (prev === item.region ? null : item.region))
            }
          />
        ))}
      </div>
    </div>
  );
}