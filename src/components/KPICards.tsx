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
  // soft pastel for gradient/accent
  from: string;
  to: string;
  // icon tint (slightly stronger)
  iconBg: string;
  iconColor: string;
  // shape blob color
  blob: string;
};

const ACCENTS: Record<string, Accent> = {
  blue:   { from: 'hsl(210, 100%, 96%)', to: 'hsl(210, 90%, 88%)',  iconBg: 'hsl(210, 90%, 94%)', iconColor: 'hsl(215, 75%, 55%)', blob: 'hsl(210, 90%, 85%)' },
  green:  { from: 'hsl(150, 70%, 95%)',  to: 'hsl(150, 60%, 85%)',  iconBg: 'hsl(150, 65%, 92%)', iconColor: 'hsl(155, 55%, 42%)', blob: 'hsl(150, 60%, 82%)' },
  orange: { from: 'hsl(28, 100%, 95%)',  to: 'hsl(28, 90%, 85%)',   iconBg: 'hsl(28, 90%, 93%)',  iconColor: 'hsl(22, 80%, 55%)',  blob: 'hsl(28, 90%, 82%)' },
  purple: { from: 'hsl(265, 80%, 96%)',  to: 'hsl(265, 70%, 88%)',  iconBg: 'hsl(265, 75%, 94%)', iconColor: 'hsl(265, 60%, 58%)', blob: 'hsl(265, 70%, 86%)' },
  pink:   { from: 'hsl(335, 90%, 96%)',  to: 'hsl(335, 80%, 88%)',  iconBg: 'hsl(335, 80%, 94%)', iconColor: 'hsl(335, 65%, 58%)', blob: 'hsl(335, 80%, 86%)' },
  teal:   { from: 'hsl(180, 70%, 94%)',  to: 'hsl(180, 60%, 84%)',  iconBg: 'hsl(180, 65%, 92%)', iconColor: 'hsl(182, 60%, 40%)', blob: 'hsl(180, 60%, 82%)' },
};

interface KPICardProps {
  icon: React.ElementType;
  title: string;
  value: React.ReactNode;
  accent: Accent;
  delay?: number;
}

function KPICard({ icon: Icon, title, value, accent, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-[22px] bg-card p-5 min-h-[120px] flex items-center gap-4"
      style={{
        boxShadow:
          '0 10px 25px -12px hsl(220 25% 70% / 0.25), 0 4px 10px -4px hsl(220 25% 70% / 0.15), inset 1px 1px 2px hsl(0 0% 100% / 0.9), inset -1px -1px 3px hsl(220 20% 85% / 0.25)',
      }}
    >
      {/* Decorative accent blob (right side) */}
      <div
        aria-hidden
        className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-80 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${accent.to}, ${accent.from} 60%, transparent 75%)`,
          filter: 'blur(2px)',
        }}
      />
      <div
        aria-hidden
        className="absolute -right-6 bottom-[-40px] w-32 h-32 rounded-full opacity-60 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accent.blob}, transparent 70%)`,
          filter: 'blur(4px)',
        }}
      />

      {/* Icon */}
      <div
        className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{
          background: `linear-gradient(145deg, hsl(0 0% 100%), ${accent.iconBg})`,
          boxShadow: `inset 2px 2px 4px hsl(0 0% 100% / 0.9), inset -2px -2px 4px ${accent.blob}, 0 4px 10px -4px ${accent.blob}`,
        }}
      >
        <Icon className="w-7 h-7" style={{ color: accent.iconColor }} strokeWidth={2.2} />
      </div>

      {/* Title + Value */}
      <div className="relative z-10 flex flex-col justify-center min-w-0 flex-1">
        <p className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 truncate">
          {title}
        </p>
        <div className="text-2xl font-bold text-foreground leading-tight truncate">
          {value}
        </div>
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

    data.forEach(r => {
      if (r.jenisDagangan === 'Eksport') totalExport += r.jumlahDaganganRM;
      else totalImport += r.jumlahDaganganRM;
      stateMap[r.negeri] = (stateMap[r.negeri] || 0) + r.jumlahDaganganRM;
      commodityMap[r.komoditiUtama] = (commodityMap[r.komoditiUtama] || 0) + r.jumlahDaganganRM;
    });

    const top3States = Object.entries(stateMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const top3Commodities = Object.entries(commodityMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return {
      totalTrade: totalExport + totalImport,
      totalExport,
      totalImport,
      tradeBalance: totalExport - totalImport,
      top3States,
      top3Commodities,
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
      value: formatCompact(stats.totalTrade),
      accent: ACCENTS.blue,
    },
    {
      icon: ArrowUpRight,
      title: t('totalExportValue'),
      value: formatCompact(stats.totalExport),
      accent: ACCENTS.green,
    },
    {
      icon: ArrowDownRight,
      title: t('totalImportValue'),
      value: formatCompact(stats.totalImport),
      accent: ACCENTS.orange,
    },
    {
      icon: Scale,
      title: t('tradeBalance'),
      value: formatCompact(stats.tradeBalance),
      accent: ACCENTS.purple,
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
