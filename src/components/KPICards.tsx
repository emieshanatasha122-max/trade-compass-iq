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
  // For sparkline + badge
  stroke: string;
  fillTop: string;
  fillBot: string;
  badgeBg: string;
  badgeText: string;
};

const ACCENTS: Record<string, Accent> = {
  blue: {
    from: 'hsl(210, 100%, 96%)', to: 'hsl(210, 90%, 88%)',
    iconBg: 'hsl(210, 90%, 94%)', iconColor: 'hsl(215, 75%, 55%)', blob: 'hsl(210, 90%, 85%)',
    stroke: 'hsl(215, 75%, 55%)', fillTop: 'hsl(215, 80%, 60%, 0.28)', fillBot: 'hsl(215, 80%, 60%, 0)',
    badgeBg: 'hsl(210, 90%, 94%)', badgeText: 'hsl(215, 75%, 45%)',
  },
  green: {
    from: 'hsl(150, 70%, 95%)', to: 'hsl(150, 60%, 85%)',
    iconBg: 'hsl(150, 65%, 92%)', iconColor: 'hsl(155, 55%, 42%)', blob: 'hsl(150, 60%, 82%)',
    stroke: 'hsl(155, 55%, 42%)', fillTop: 'hsl(155, 60%, 50%, 0.28)', fillBot: 'hsl(155, 60%, 50%, 0)',
    badgeBg: 'hsl(150, 65%, 92%)', badgeText: 'hsl(155, 55%, 32%)',
  },
  orange: {
    from: 'hsl(28, 100%, 95%)', to: 'hsl(28, 90%, 85%)',
    iconBg: 'hsl(28, 90%, 93%)', iconColor: 'hsl(22, 80%, 55%)', blob: 'hsl(28, 90%, 82%)',
    stroke: 'hsl(22, 80%, 55%)', fillTop: 'hsl(22, 85%, 60%, 0.28)', fillBot: 'hsl(22, 85%, 60%, 0)',
    badgeBg: 'hsl(28, 90%, 93%)', badgeText: 'hsl(22, 80%, 42%)',
  },
  purple: {
    from: 'hsl(265, 80%, 96%)', to: 'hsl(265, 70%, 88%)',
    iconBg: 'hsl(265, 75%, 94%)', iconColor: 'hsl(265, 60%, 58%)', blob: 'hsl(265, 70%, 86%)',
    stroke: 'hsl(265, 60%, 58%)', fillTop: 'hsl(265, 65%, 62%, 0.28)', fillBot: 'hsl(265, 65%, 62%, 0)',
    badgeBg: 'hsl(265, 75%, 94%)', badgeText: 'hsl(265, 60%, 48%)',
  },
  pink: {
    from: 'hsl(335, 90%, 96%)', to: 'hsl(335, 80%, 88%)',
    iconBg: 'hsl(335, 80%, 94%)', iconColor: 'hsl(335, 65%, 58%)', blob: 'hsl(335, 80%, 86%)',
    stroke: 'hsl(335, 65%, 58%)', fillTop: 'hsl(335, 70%, 62%, 0.28)', fillBot: 'hsl(335, 70%, 62%, 0)',
    badgeBg: 'hsl(335, 80%, 94%)', badgeText: 'hsl(335, 65%, 48%)',
  },
  teal: {
    from: 'hsl(180, 70%, 94%)', to: 'hsl(180, 60%, 84%)',
    iconBg: 'hsl(180, 65%, 92%)', iconColor: 'hsl(182, 60%, 40%)', blob: 'hsl(180, 60%, 82%)',
    stroke: 'hsl(182, 60%, 40%)', fillTop: 'hsl(182, 65%, 45%, 0.28)', fillBot: 'hsl(182, 65%, 45%, 0)',
    badgeBg: 'hsl(180, 65%, 92%)', badgeText: 'hsl(182, 60%, 30%)',
  },
};

// Simple smooth sparkline (Catmull-Rom style smoothing -> bezier)
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(' ');
}

interface SparklineProps {
  values: number[];
  accent: Accent;
  gradientId: string;
}

function Sparkline({ values, accent, gradientId }: SparklineProps) {
  const W = 100;
  const H = 28;
  const PAD = 2;
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (W - PAD * 2) / Math.max(1, values.length - 1);
  const points = values.map((v, i) => ({
    x: PAD + i * step,
    y: PAD + (H - PAD * 2) * (1 - (v - min) / range),
  }));
  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full h-7"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent.fillTop} />
          <stop offset="100%" stopColor={accent.fillBot} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={accent.stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface KPICardProps {
  icon: React.ElementType;
  title: string;
  value: React.ReactNode;
  accent: Accent;
  delay?: number;
  percentage?: number | null;
  sparkValues?: number[];
  sparkId: string;
}

function PercentBadge({ pct, accent }: { pct: number; accent: Accent }) {
  const isUp = pct >= 0;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
  return (
    <div
      className="absolute top-3 right-3 z-20 flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm"
      style={{ backgroundColor: accent.badgeBg, color: accent.badgeText }}
    >
      <Arrow className="w-3 h-3" strokeWidth={2.5} />
      <span>{Math.abs(pct).toFixed(1)}%</span>
    </div>
  );
}

function KPICard({ icon: Icon, title, value, accent, delay = 0, percentage, sparkValues, sparkId }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="kpi-neumorphic-card relative overflow-hidden rounded-[22px] bg-card p-5 min-h-[140px] flex items-center gap-4 dark:border dark:border-border"
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

      {/* Percentage Badge (top-right) */}
      {percentage !== null && percentage !== undefined && (
        <PercentBadge pct={percentage} accent={accent} />
      )}

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

      {/* Title + Value + Sparkline */}
      <div className="relative z-10 flex flex-col justify-center min-w-0 flex-1">
        <p className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 truncate pr-14">
          {title}
        </p>
        <div className="text-2xl font-bold text-foreground leading-tight truncate mb-1.5">
          {value}
        </div>
        {sparkValues && sparkValues.length > 1 && (
          <div className="-mx-1 -mb-1">
            <Sparkline values={sparkValues} accent={accent} gradientId={sparkId} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function KPICards({ data }: Props) {
  const { t } = useLanguage();

  const stats = useMemo(() => {
    let totalExport = 0, totalImport = 0;
    const stateMap: Record<string, number> = {};
    const commodityMap: Record<string, number> = {};

    // Monthly buckets for sparklines (key = year*12+month)
    const monthlyExport: Record<number, number> = {};
    const monthlyImport: Record<number, number> = {};
    const monthlyTotal: Record<number, number> = {};

    data.forEach(r => {
      const key = r.tahun * 12 + r.bulan;
      if (r.jenisDagangan === 'Eksport') {
        totalExport += r.jumlahDaganganRM;
        monthlyExport[key] = (monthlyExport[key] || 0) + r.jumlahDaganganRM;
      } else {
        totalImport += r.jumlahDaganganRM;
        monthlyImport[key] = (monthlyImport[key] || 0) + r.jumlahDaganganRM;
      }
      monthlyTotal[key] = (monthlyTotal[key] || 0) + r.jumlahDaganganRM;
      stateMap[r.negeri] = (stateMap[r.negeri] || 0) + r.jumlahDaganganRM;
      commodityMap[r.komoditiUtama] = (commodityMap[r.komoditiUtama] || 0) + r.jumlahDaganganRM;
    });

    const sortedKeys = Array.from(new Set([
      ...Object.keys(monthlyTotal).map(Number),
      ...Object.keys(monthlyExport).map(Number),
      ...Object.keys(monthlyImport).map(Number),
    ])).sort((a, b) => a - b);

    const sparkTotal = sortedKeys.map(k => monthlyTotal[k] || 0);
    const sparkExport = sortedKeys.map(k => monthlyExport[k] || 0);
    const sparkImport = sortedKeys.map(k => monthlyImport[k] || 0);
    const sparkBalance = sortedKeys.map(k => (monthlyExport[k] || 0) - (monthlyImport[k] || 0));

    // % change: last vs previous period (last point vs avg of prior points)
    const pctChange = (arr: number[]): number | null => {
      if (arr.length < 2) return null;
      const last = arr[arr.length - 1];
      const prior = arr.slice(0, -1);
      const priorAvg = prior.reduce((s, v) => s + v, 0) / prior.length;
      if (priorAvg === 0) return null;
      return ((last - priorAvg) / Math.abs(priorAvg)) * 100;
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
      sparkTotal,
      sparkExport,
      sparkImport,
      sparkBalance,
      pctTotal: pctChange(sparkTotal),
      pctExport: pctChange(sparkExport),
      pctImport: pctChange(sparkImport),
      pctBalance: pctChange(sparkBalance),
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
      percentage: stats.pctTotal,
      sparkValues: stats.sparkTotal,
      sparkId: 'spark-total',
    },
    {
      icon: ArrowUpRight,
      title: t('totalExportValue'),
      value: `RM ${formatCompact(stats.totalExport)}`,
      accent: ACCENTS.green,
      percentage: stats.pctExport,
      sparkValues: stats.sparkExport,
      sparkId: 'spark-export',
    },
    {
      icon: ArrowDownRight,
      title: t('totalImportValue'),
      value: `RM ${formatCompact(stats.totalImport)}`,
      accent: ACCENTS.orange,
      percentage: stats.pctImport,
      sparkValues: stats.sparkImport,
      sparkId: 'spark-import',
    },
    {
      icon: Scale,
      title: t('tradeBalance'),
      value: `RM ${formatCompact(stats.tradeBalance)}`,
      accent: ACCENTS.purple,
      percentage: stats.pctBalance,
      sparkValues: stats.sparkBalance,
      sparkId: 'spark-balance',
    },
  ];

  const highlightCards = [
    {
      icon: MapPin,
      title: t('top3States'),
      value: renderTopList(stats.top3States),
      accent: ACCENTS.pink,
      sparkId: 'spark-states',
    },
    {
      icon: Package,
      title: t('top3Commodities'),
      value: renderTopList(stats.top3Commodities, true),
      accent: ACCENTS.teal,
      sparkId: 'spark-commodities',
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
            percentage={c.percentage}
            sparkValues={c.sparkValues}
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
            sparkId={c.sparkId}
          />
        ))}
      </div>
    </div>
  );
}
