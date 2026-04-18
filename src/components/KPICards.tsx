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
  // Solid pastel for the right-side accent shape
  solid: string;
  solidDeep: string;
  // Icon tint
  iconBg: string;
  iconColor: string;
  iconShadow: string;
};

const ACCENTS: Record<string, Accent> = {
  blue:   { solid: 'hsl(210, 90%, 82%)', solidDeep: 'hsl(215, 85%, 70%)', iconBg: 'hsl(210, 90%, 94%)', iconColor: 'hsl(215, 75%, 50%)', iconShadow: 'hsl(215, 80%, 75%)' },
  green:  { solid: 'hsl(150, 65%, 80%)', solidDeep: 'hsl(155, 60%, 65%)', iconBg: 'hsl(150, 65%, 92%)', iconColor: 'hsl(155, 55%, 38%)', iconShadow: 'hsl(150, 60%, 72%)' },
  orange: { solid: 'hsl(28, 90%, 80%)',  solidDeep: 'hsl(22, 85%, 68%)',  iconBg: 'hsl(28, 90%, 93%)',  iconColor: 'hsl(22, 80%, 52%)',  iconShadow: 'hsl(28, 85%, 75%)' },
  purple: { solid: 'hsl(265, 75%, 84%)', solidDeep: 'hsl(265, 65%, 70%)', iconBg: 'hsl(265, 75%, 94%)', iconColor: 'hsl(265, 60%, 55%)', iconShadow: 'hsl(265, 70%, 78%)' },
  pink:   { solid: 'hsl(335, 85%, 84%)', solidDeep: 'hsl(335, 70%, 70%)', iconBg: 'hsl(335, 80%, 94%)', iconColor: 'hsl(335, 65%, 55%)', iconShadow: 'hsl(335, 75%, 78%)' },
  teal:   { solid: 'hsl(180, 60%, 78%)', solidDeep: 'hsl(182, 55%, 60%)', iconBg: 'hsl(180, 65%, 92%)', iconColor: 'hsl(182, 60%, 38%)', iconShadow: 'hsl(180, 55%, 70%)' },
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
      className="relative overflow-hidden rounded-[22px] bg-card p-5 pr-24 min-h-[120px] flex items-center gap-4"
      style={{
        boxShadow:
          '0 12px 28px -14px hsl(220 25% 60% / 0.28), 0 4px 10px -4px hsl(220 25% 70% / 0.18), inset 1px 1px 2px hsl(0 0% 100% / 0.95)',
      }}
    >
      {/* SOLID curved accent shape on the right side (clearly layered) */}
      <div
        aria-hidden
        className="absolute right-0 top-0 bottom-0 w-[90px] pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${accent.solid} 0%, ${accent.solidDeep} 100%)`,
          clipPath: 'ellipse(85% 120% at 100% 50%)',
          boxShadow: `inset 2px 0 6px hsl(0 0% 100% / 0.35), -4px 0 12px -6px ${accent.solidDeep}`,
        }}
      />

      {/* Icon (embossed, matches accent) */}
      <div
        className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{
          background: `linear-gradient(145deg, hsl(0 0% 100%), ${accent.iconBg})`,
          boxShadow: `inset 2px 2px 4px hsl(0 0% 100% / 0.95), inset -2px -2px 4px ${accent.iconShadow}, 0 4px 10px -4px ${accent.iconShadow}`,
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

  const renderTopList = (items: [string, number][]) => (
    <div className="space-y-0.5">
      {items.map(([name], i) => (
        <div key={name} className="flex items-baseline gap-1.5">
          <span className="text-xs font-bold text-muted-foreground/70">{i + 1}.</span>
          <span className="text-sm font-semibold text-foreground truncate">{name}</span>
        </div>
      ))}
    </div>
  );

  const cards = [
    { icon: TrendingUp,     title: t('totalTradeValue'),  value: formatCompact(stats.totalTrade),   accent: ACCENTS.blue },
    { icon: ArrowUpRight,   title: t('totalExportValue'), value: formatCompact(stats.totalExport),  accent: ACCENTS.green },
    { icon: ArrowDownRight, title: t('totalImportValue'), value: formatCompact(stats.totalImport),  accent: ACCENTS.orange },
    { icon: Scale,          title: t('tradeBalance'),     value: formatCompact(stats.tradeBalance), accent: ACCENTS.purple },
    { icon: MapPin,         title: t('top3States'),       value: renderTopList(stats.top3States),       accent: ACCENTS.pink },
    { icon: Package,        title: t('top3Commodities'),  value: renderTopList(stats.top3Commodities),  accent: ACCENTS.teal },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <KPICard key={c.title} icon={c.icon} title={c.title} value={c.value} accent={c.accent} delay={i * 0.06} />
      ))}
    </div>
  );
}
