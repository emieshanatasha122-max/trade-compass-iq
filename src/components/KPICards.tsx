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
  // neon glow rgb triplet (used in box-shadow & border)
  glow: string;
  // icon tint
  iconColor: string;
};

const ACCENTS: Record<string, Accent> = {
  blue:   { glow: '80, 140, 255',  iconColor: 'rgb(120, 180, 255)' },
  green:  { glow: '80, 230, 160',  iconColor: 'rgb(110, 240, 180)' },
  orange: { glow: '255, 130, 90',  iconColor: 'rgb(255, 160, 110)' },
  purple: { glow: '170, 120, 255', iconColor: 'rgb(190, 150, 255)' },
  pink:   { glow: '255, 110, 180', iconColor: 'rgb(255, 140, 200)' },
  teal:   { glow: '90, 220, 220',  iconColor: 'rgb(120, 235, 235)' },
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
      whileHover={{ y: -2, scale: 1.02 }}
      className="kpi-neon-card group relative overflow-hidden rounded-[22px] p-5 min-h-[120px] flex items-center gap-4"
      style={{
        ['--neon-glow' as any]: accent.glow,
      }}
    >
      {/* Subtle inner radial highlight */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: `radial-gradient(circle at 0% 0%, rgba(${accent.glow}, 0.12), transparent 60%)`,
        }}
      />

      {/* Icon */}
      <div className="kpi-neon-icon relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
        <Icon className="w-7 h-7" style={{ color: accent.iconColor }} strokeWidth={2.2} />
      </div>

      {/* Title + Value */}
      <div className="relative z-10 flex flex-col justify-center min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-1.5 truncate" style={{ color: 'rgba(180, 200, 255, 0.7)' }}>
          {title}
        </p>
        <div className="text-2xl font-bold leading-tight truncate" style={{ color: '#FFFFFF' }}>
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
      value: `RM ${formatCompact(stats.totalTrade)}`,
      accent: ACCENTS.blue,
    },
    {
      icon: ArrowUpRight,
      title: t('totalExportValue'),
      value: `RM ${formatCompact(stats.totalExport)}`,
      accent: ACCENTS.green,
    },
    {
      icon: ArrowDownRight,
      title: t('totalImportValue'),
      value: `RM ${formatCompact(stats.totalImport)}`,
      accent: ACCENTS.orange,
    },
    {
      icon: Scale,
      title: t('tradeBalance'),
      value: `RM ${formatCompact(stats.tradeBalance)}`,
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
