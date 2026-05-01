import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe2, Map } from 'lucide-react';

const REGIONS = ['AFTA', 'EU', 'NAFTA'] as const;
type RegionKey = (typeof REGIONS)[number];
type Mode = 'export' | 'import';

const REGION_DISPLAY: Record<RegionKey, string> = {
  AFTA: 'A.F.T.A',
  EU: 'E.U.',
  NAFTA: 'N.A.F.T.A',
};

const REGION_THEME: Record<
  RegionKey,
  {
    color: string;
    glow: string;
    icon: React.ElementType;
  }
> = {
  AFTA: {
    color: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.55)',
    icon: Globe2,
  },
  EU: {
    color: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.55)',
    icon: Map,
  },
  NAFTA: {
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.55)',
    icon: Map,
  },
};

const STATE_FLAGS: Record<string, string> = {
  johor: '/flags/Johor.svg',
  kedah: '/flags/Kedah.svg',
  kelantan: '/flags/Kelantan.svg',
  melaka: '/flags/Melaka.svg',
  'negeri sembilan': '/flags/Negeri_Sembilan.svg',
  pahang: '/flags/Pahang.svg',
  perak: '/flags/Perak.svg',
  perlis: '/flags/Perlis.svg',
  'pulau pinang': '/flags/Pulau_Pinang.svg',
  sabah: '/flags/Sabah.svg',
  sarawak: '/flags/Sarawak.svg',
  selangor: '/flags/Selangor.svg',
  terengganu: '/flags/Terengganu.svg',
  'wp kuala lumpur': '/flags/WP_Kuala_Lumpur.svg',
  'wp labuan': '/flags/WP_Labuan.svg',
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

function getStateFlag(name: string): string | null {
  return STATE_FLAGS[name.trim().toLowerCase()] || null;
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

interface RegionData {
  region: RegionKey;
  exportValue: number;
  importValue: number;
  statesExport: RegionState[];
  statesImport: RegionState[];
}

interface Props {
  data: TradeRecord[];
}

function RegionBubble({
  item,
  mode,
  grandTotal,
  positionClass,
  onClick,
}: {
  item: RegionData;
  mode: Mode;
  grandTotal: number;
  positionClass: string;
  onClick: () => void;
}) {
  const theme = REGION_THEME[item.region];
  const Icon = theme.icon;
  const value = mode === 'export' ? item.exportValue : item.importValue;
  const pct = grandTotal > 0 ? (value / grandTotal) * 100 : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute z-20 flex h-32 w-32 flex-col items-center justify-center overflow-hidden rounded-full border bg-black/60 text-center backdrop-blur-md transition hover:scale-105 md:h-36 md:w-36 ${positionClass}`}
      style={{
        borderColor: theme.color,
        boxShadow: `0 0 28px ${theme.glow}`,
      }}
    >

      <Icon className="mb-2 h-7 w-7" style={{ color: theme.color }} />

      <p
        className="text-lg font-black tracking-[0.14em] md:text-xl"
        style={{ color: theme.color }}
      >
        {REGION_DISPLAY[item.region]}
      </p>

      <p className="mt-1 text-sm font-bold text-white">{formatRM(value)}</p>

      <p className="text-lg font-black" style={{ color: theme.color }}>
        {pct.toFixed(1)}%
      </p>
    </button>
  );
}

function SelectedRegionNode({
  item,
  mode,
  grandTotal,
}: {
  item: RegionData;
  mode: Mode;
  grandTotal: number;
}) {
  const theme = REGION_THEME[item.region];
  const Icon = theme.icon;
  const value = mode === 'export' ? item.exportValue : item.importValue;
  const pct = grandTotal > 0 ? (value / grandTotal) * 100 : 0;

  return (
    <motion.div
      layoutId={`region-${item.region}`}
      initial={{ scale: 0.65, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.65, opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="z-20 flex h-36 w-36 flex-col items-center justify-center rounded-full border bg-black/65 text-center backdrop-blur-md md:h-40 md:w-40"
      style={{
        borderColor: theme.color,
        boxShadow: `0 0 34px ${theme.glow}`,
      }}
    >
      <Icon className="mb-2 h-8 w-8" style={{ color: theme.color }} />

      <p
        className="text-xl font-black tracking-[0.14em] md:text-2xl"
        style={{ color: theme.color }}
      >
        {REGION_DISPLAY[item.region]}
      </p>

      <p className="mt-1 text-sm font-bold text-white">{formatRM(value)}</p>

      <p className="text-lg font-black" style={{ color: theme.color }}>
        {pct.toFixed(1)}%
      </p>
    </motion.div>
  );
}

export default function EconomicRegionCards({ data }: Props) {
  const { lang } = useLanguage();
  const [mode, setMode] = useState<Mode>('export');
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | null>(null);

  const chartData = useMemo<RegionData[]>(() => {
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

      const exportValue = statesExport.reduce((a, b) => a + b.value, 0);
      const importValue = statesImport.reduce((a, b) => a + b.value, 0);

      return {
        region,
        exportValue,
        importValue,
        statesExport,
        statesImport,
      };
    });
  }, [data, lang]);

  const grandTotal = chartData.reduce((sum, item) => {
    return sum + (mode === 'export' ? item.exportValue : item.importValue);
  }, 0);

  const selectedData = selectedRegion
    ? chartData.find((item) => item.region === selectedRegion)
    : null;

  const selectedStates = selectedData
    ? mode === 'export'
      ? selectedData.statesExport.slice(0, 3)
      : selectedData.statesImport.slice(0, 3)
    : [];

  return (
      <div
        className="relative min-h-[520px] overflow-hidden rounded-xl border border-border bg-card/70 p-4 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/economic-region-bg.png')",
        }}
      >

      {/* Background Enhancement */}
      <div className="pointer-events-none absolute inset-0">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:42px_42px]" />
        </div>

        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* EU glow */}
        <div className="absolute bottom-10 left-16 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

        {/* NAFTA glow */}
        <div className="absolute bottom-10 right-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Corner Shadows */}
      <div className="absolute inset-0">
        {/* Top Left */}
        <div className="absolute left-0 top-0 h-40 w-40 bg-cyan-500/10 blur-3xl" />

        {/* Top Right */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-violet-500/10 blur-3xl" />

        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-orange-500/10 blur-3xl" />

        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 h-40 w-40 bg-cyan-400/10 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {!selectedData ? (
          <motion.div
            key="orbit-view"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3 }}
            className="relative mx-auto w-full max-w-[620px] min-h-[520px]"
          >
            <div className="absolute inset-0 flex items-center justify-center"></div>

            {/* Orbit background (animated neon) */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* INNER ORBIT (AFTA - cyan) */}
              <div
                className="absolute h-[210px] w-[210px] rounded-full border"
                style={{
                  borderColor: 'rgba(34, 211, 238, 0.45)',
                  boxShadow: '0 0 18px rgba(34, 211, 238, 0.18)',
                }}
              >
                <div className="absolute inset-0 animate-[orbitRotate_12s_linear_infinite]">
                  <div className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_16px_6px_rgba(34,211,238,0.8)]" />
                </div>
              </div>

              {/* MIDDLE ORBIT (EU - orange) */}
              <div
                className="absolute h-[320px] w-[320px] rounded-full border"
                style={{
                  borderColor: 'rgba(251, 146, 60, 0.42)',
                  boxShadow: '0 0 20px rgba(251, 146, 60, 0.16)',
                }}
              >
                <div className="absolute inset-0 animate-[orbitRotate_14s_linear_infinite]">
                  <div className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-orange-400 shadow-[0_0_16px_6px_rgba(251,146,60,0.8)]" />
                </div>
              </div>

              {/* OUTER ORBIT (NAFTA - purple) */}
              <div
                className="absolute h-[405px] w-[405px] rounded-full border"
                style={{
                  borderColor: 'rgba(168, 85, 247, 0.42)',
                  boxShadow: '0 0 22px rgba(168, 85, 247, 0.16)',
                }}
              >
                <div className="absolute inset-0 animate-[orbitRotate_16s_linear_infinite]">
                  <div className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-violet-400 shadow-[0_0_16px_6px_rgba(168,85,247,0.8)]" />
                </div>
              </div>
            </div>

            {/* Soft glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="absolute bottom-8 left-20 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
              <div className="absolute bottom-8 right-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
            </div>

            {/* Center circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-cyan-300/70 bg-black/65 text-center shadow-2xl shadow-cyan-500/25">
                <Globe2 className="mb-1 h-8 w-8 text-cyan-300" />
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                  Trade
                </p>
                <p className="text-[10px] text-muted-foreground">Core</p>
              </div>
            </div>

            {/* Region bubbles */}
            {chartData.map((item) => {
              const positionClass =
                item.region === 'AFTA'
                  ? 'left-1/2 top-2 -translate-x-1/2'
                  : item.region === 'EU'
                    ? 'bottom-4 left-12'
                    : 'bottom-4 right-12';

              return (
                <RegionBubble
                  key={item.region}
                  item={item}
                  mode={mode}
                  grandTotal={grandTotal}
                  positionClass={positionClass}
                  onClick={() => setSelectedRegion(item.region)}
                />
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35 }}
            className="relative z-20 min-h-[440px]"
          >
            <button
              type="button"
              onClick={() => setSelectedRegion(null)}
              className="absolute left-0 top-0 z-40 inline-flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-2 text-xs font-semibold text-foreground backdrop-blur hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              {lang === 'bm' ? 'Kembali' : 'Back'}
            </button>

            <div className="flex min-h-[440px] items-center justify-center">
              <div className="relative grid w-full max-w-[620px] grid-cols-[170px_90px_1fr] items-center gap-2">
                {/* Left selected node */}
                <div className="flex justify-center">
                  <SelectedRegionNode
                    item={selectedData}
                    mode={mode}
                    grandTotal={grandTotal}
                  />
                </div>

                {/* Center flow line */}
                <div className="relative flex h-[260px] items-center justify-center">
                  <svg
                    className="h-full w-full overflow-visible"
                    viewBox="0 0 90 260"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 130 H48"
                      stroke={REGION_THEME[selectedData.region].color}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M48 70 V190"
                      stroke={REGION_THEME[selectedData.region].color}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M48 70 H90"
                      stroke={REGION_THEME[selectedData.region].color}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M48 130 H90"
                      stroke={REGION_THEME[selectedData.region].color}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M48 190 H90"
                      stroke={REGION_THEME[selectedData.region].color}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Right states */}
                <div className="space-y-4">
                  {selectedStates.length > 0 ? (
                    selectedStates.map((state, index) => (
                      <motion.div
                        key={state.name}
                        initial={{ x: 18, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.25, delay: index * 0.08 }}
                        className="flex h-[58px] items-center justify-between rounded-xl border border-border bg-card/55 px-4 shadow-sm backdrop-blur"
                      >
                        <div className="flex min-w-0 items-center gap-3">

                          {getStateFlag(state.name) ? (
                          <img
                            src={getStateFlag(state.name) as string}
                            alt={state.name}
                            className="h-8 w-8 shrink-0 rounded-full border border-border bg-background object-cover"
                          />
                        ) : (
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold"
                            style={{
                              borderColor: REGION_THEME[selectedData.region].color,
                              color: REGION_THEME[selectedData.region].color,
                            }}
                          >
                            {index + 1}
                          </span>
                        )}

                          <span className="truncate text-sm font-semibold text-foreground">
                            {state.name}
                          </span>
                        </div>

                        <span className="shrink-0 text-sm font-bold text-foreground">
                          {formatRM(state.value)}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                      {lang === 'bm'
                        ? 'Tiada negeri direkodkan.'
                        : 'No states recorded.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}