import React, { useMemo } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Scale, MapPin, Package } from 'lucide-react';
import { motion } from 'framer-motion';

function formatCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`;
  return `${sign}${abs.toLocaleString()}`;
}

interface Props {
  data: TradeRecord[];
}

type Accent = {
  from: string;
  to: string;
  iconBg: string;
  iconColor: string;
  blob: string;
  // sparkline / badge stroke color (slightly stronger than icon)
  stroke: string;
  // soft badge background
  badgeBg: string;
};

const ACCENTS: Record<string, Accent> = {
  blue:   { from: 'hsl(210, 100%, 96%)', to: 'hsl(210, 90%, 88%)',  iconBg: 'hsl(210, 90%, 94%)', iconColor: 'hsl(215, 75%, 55%)', blob: 'hsl(210, 90%, 85%)', stroke: 'hsl(215, 80%, 55%)', badgeBg: 'hsl(210, 90%, 92%)' },
  green:  { from: 'hsl(150, 70%, 95%)',  to: 'hsl(150, 60%, 85%)',  iconBg: 'hsl(150, 65%, 92%)', iconColor: 'hsl(155, 55%, 42%)', blob: 'hsl(150, 60%, 82%)', stroke: 'hsl(155, 65%, 42%)', badgeBg: 'hsl(150, 65%, 90%)' },
  orange: { from: 'hsl(28, 100%, 95%)',  to: 'hsl(28, 90%, 85%)',   iconBg: 'hsl(28, 90%, 93%)',  iconColor: 'hsl(22, 80%, 55%)',  blob: 'hsl(28, 90%, 82%)',  stroke: 'hsl(22, 85%, 52%)',  badgeBg: 'hsl(28, 90%, 92%)'  },
  purple: { from: 'hsl(265, 80%, 96%)',  to: 'hsl(265, 70%, 88%)',  iconBg: 'hsl(265, 75%, 94%)', iconColor: 'hsl(265, 60%, 58%)', blob: 'hsl(265, 70%, 86%)', stroke: 'hsl(265, 65%, 55%)', badgeBg: 'hsl(265, 75%, 93%)' },
  pink:   { from: 'hsl(335, 90%, 96%)',  to: 'hsl(335, 80%, 88%)',  iconBg: 'hsl(335, 80%, 94%)', iconColor: 'hsl(335, 65%, 58%)', blob: 'hsl(335, 80%, 86%)', stroke: 'hsl(335, 70%, 55%)', badgeBg: 'hsl(335, 80%, 93%)' },
  teal:   { from: 'hsl(180, 70%, 94%)',  to: 'hsl(180, 60%, 84%)',  iconBg: 'hsl(180, 65%, 92%)', iconColor: 'hsl(182, 60%, 40%)', blob: 'hsl(180, 60%, 82%)', stroke: 'hsl(182, 65%, 40%)', badgeBg: 'hsl(180, 65%, 91%)' },
};

interface SparklineProps {
  values: number[];
  stroke: string;
  gradientId: string;
}

function Sparkline({ values, stroke, gradientId }: SparklineProps) {
  if (!values || values.length < 2) return null;
  const w = 100;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = w / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / range) * h;
    return [x, y] as const;
  });

  // Smooth curve using cubic bezier
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full h-7"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface KPICardProps {
  icon: React.ElementType;
  title: string;
  value: React.ReactNode;
  accent: Accent;
  delay?: number;
  pct?: number | null;
  sparkValues?: number[];
  sparkId?: string;
}

function KPICard({ icon: Icon, title, value, accent, delay = 0, pct, sparkValues, sparkId }: KPICardProps) {
  const showSpark = sparkValues && sparkValues.length >= 2 && sparkId;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="kpi-neumorphic-card relative overflow-hidden rounded-[22px] bg-card p-5 min-h-[120px] flex flex-col gap-3 dark:border dark:border-border"
    >
      {/* Decorative accent blobs — hidden in dark mode via CSS */}
      <div
        aria-hidden
        className="kpi-blob absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-80 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${accent.to}, ${accent.from} 60%, transparent 75%)`,
          filter: 'blur(2px)',
        }}
      />
      <div
        aria-hidden
        className="kpi-blob absolute -right-6 bottom-[-40px] w-32 h-32 rounded-full opacity-60 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accent.blob}, transparent 70%)`,
          filter: 'blur(4px)',
        }}
      />

      {/* Percentage badge top-right */}
      {pct !== undefined && pct !== null && (
        <div
          className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums"
          style={{
            background: accent.badgeBg,
            color: accent.stroke,
            border: `1px solid ${accent.stroke}33`,
          }}
        >
          {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
        </div>
      )}

      <div className="flex items-center gap-4 flex-1">
        {/* Icon */}
        <div
          className="kpi-icon-wrap relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            ['--accent-icon-bg' as any]: accent.iconBg,
            ['--accent-blob' as any]: accent.blob,
          }}
        >
          <Icon className="w-7 h-7" style={{ color: accent.iconColor }} strokeWidth={2.2} />
        </div>

        {/* Title + Value */}
        <div className="relative z-10 flex flex-col justify-center min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 truncate pr-12">
            {title}
          </p>
          <div className="text-2xl font-bold text-foreground leading-tight truncate">
            {value}
          </div>
        </div>
      </div>

      {/* Sparkline bottom */}
      {showSpark && (
        <div className="relative z-10 -mx-1 -mb-1">
          <Sparkline values={sparkValues!} stroke={accent.stroke} gradientId={sparkId!} />
        </div>
      )}
    </motion.div>
  );
}

export default function KPICards({ data }: Props) {
  const { t } = useLanguage();

  const stats = useMemo(() => {
    let totalExport = 0, totalImport = 0;
    const stateMap: Record<string, number> = {};
    const commodityMap: Record<string, number> = {};

    // Bucket monthly totals for sparklines: key = year*12 + (month-1)
    const tradeByBucket: Record<number, number> = {};
    const exportByBucket: Record<number, number> = {};
    const importByBucket: Record<number, number> = {};
    const balanceBucketKeys = new Set<number>();

    data.forEach(r => {
      if (r.jenisDagangan === 'Eksport') totalExport += r.jumlahDaganganRM;
      else totalImport += r.jumlahDaganganRM;
      stateMap[r.negeri] = (stateMap[r.negeri] || 0) + r.jumlahDaganganRM;
      commodityMap[r.komoditiUtama] = (commodityMap[r.komoditiUtama] || 0) + r.jumlahDaganganRM;

      const bucket = r.tahun * 12 + (r.bulan - 1);
      tradeByBucket[bucket] = (tradeByBucket[bucket] || 0) + r.jumlahDaganganRM;
      if (r.jenisDagangan === 'Eksport') {
        exportByBucket[bucket] = (exportByBucket[bucket] || 0) + r.jumlahDaganganRM;
      } else {
        importByBucket[bucket] = (importByBucket[bucket] || 0) + r.jumlahDaganganRM;
      }
      balanceBucketKeys.add(bucket);
    });

    const sortedBuckets = [...balanceBucketKeys].sort((a, b) => a - b);
    const tradeSeries = sortedBuckets.map(b => tradeByBucket[b] || 0);
    const exportSeries = sortedBuckets.map(b => exportByBucket[b] || 0);
    const importSeries = sortedBuckets.map(b => importByBucket[b] || 0);
    const balanceSeries = sortedBuckets.map(b => (exportByBucket[b] || 0) - (importByBucket[b] || 0));

    // Compute % change: last value vs average of prior values in series
    const pctChange = (series: number[]): number | null => {
      if (series.length < 2) return null;
      const last = series[series.length - 1];
      const prior = series.slice(0, -1);
      const avg = prior.reduce((a, b) => a + b, 0) / prior.length;
      if (avg === 0) return null;
      return ((last - avg) / Math.abs(avg)) * 100;
    };

    const top3States = Object.entries(stateMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const top3Commodities = Object.entries(commodityMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return {
      totalTrade: totalExport + totalImport,
      totalExport,
      totalImport,
      tradeBalance: totalExport - totalImport,
      top3States,
      top3Commodities,
      tradeSeries,
      exportSeries,
      importSeries,
      balanceSeries,
      tradePct: pctChange(tradeSeries),
      exportPct: pctChange(exportSeries),
      importPct: pctChange(importSeries),
      balancePct: pctChange(balanceSeries),
    };
  }, [data]);

  const toSentenceCase = (s: string) => {
    const lower = s.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const renderTopList = (items: [string, number][], sentenceCase = false) => (
    <div className="space-y-0.5">
      {items.map(([name], i) => (
        <div key={name} className="flex items-baseline gap-1.5">
          <span className="text-xs font-bold text-muted-foreground/70">{i + 1}.</span>
          <span className="text-sm font-semibold text-foreground truncate">
            {sentenceCase ? toSentenceCase(name) : name}
          </span>
        </div>
      ))}
    </div>
  );

  const cards = [
    {
      icon: TrendingUp,
      title: t('totalTradeValue'),
      value: `RM ${formatCompact(stats.totalTrade)}`,
      accent: ACCENTS.blue,
      pct: stats.tradePct,
      spark: stats.tradeSeries,
      sparkId: 'spark-trade',
    },
    {
      icon: ArrowUpRight,
      title: t('totalExportValue'),
      value: `RM ${formatCompact(stats.totalExport)}`,
      accent: ACCENTS.green,
      pct: stats.exportPct,
      spark: stats.exportSeries,
      sparkId: 'spark-export',
    },
    {
      icon: ArrowDownRight,
      title: t('totalImportValue'),
      value: `RM ${formatCompact(stats.totalImport)}`,
      accent: ACCENTS.orange,
      pct: stats.importPct,
      spark: stats.importSeries,
      sparkId: 'spark-import',
    },
    {
      icon: Scale,
      title: t('tradeBalance'),
      value: `RM ${formatCompact(stats.tradeBalance)}`,
      accent: ACCENTS.purple,
      pct: stats.balancePct,
      spark: stats.balanceSeries,
      sparkId: 'spark-balance',
    },
  ];

  const highlightCards = [
    {
      icon: MapPin,
      title: t('top3States'),
      value: renderTopList(stats.top3States),
      accent: ACCENTS.pink,
    },
    {
      icon: Package,
      title: t('top3Commodities'),
      value: renderTopList(stats.top3Commodities, true),
      accent: ACCENTS.teal,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top row: 4 primary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <KPICard
            key={c.title}
            icon={c.icon}
            title={c.title}
            value={c.value}
            accent={c.accent}
            delay={i * 0.06}
            pct={c.pct}
            sparkValues={c.spark}
            sparkId={c.sparkId}
          />
        ))}
      </div>

      {/* Second row: 2 highlight cards (50/50) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {highlightCards.map((c, i) => (
          <KPICard
            key={c.title}
            icon={c.icon}
            title={c.title}
            value={c.value}
            accent={c.accent}
            delay={(cards.length + i) * 0.06}
          />
        ))}
      </div>
    </div>
  );
}
