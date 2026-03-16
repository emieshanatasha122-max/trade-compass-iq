import React, { useMemo } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage, ENTERPRISE_LABEL_MAP } from '@/contexts/LanguageContext';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Scale, MapPin, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import InfoTooltip from './InfoTooltip';

function formatRM(value: number): string {
  if (Math.abs(value) >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (Math.abs(value) >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

interface Props {
  data: TradeRecord[];
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

  const kpis = [
    {
      icon: TrendingUp,
      label: t('totalTradeValue'),
      value: formatRM(stats.totalTrade),
      tooltip: t('tooltipTotalTrade'),
      gradient: 'from-[hsl(187,72%,42%)] to-[hsl(200,65%,50%)]',
    },
    {
      icon: ArrowUpRight,
      label: t('totalExportValue'),
      value: formatRM(stats.totalExport),
      tooltip: t('tooltipExport'),
      gradient: 'from-[hsl(155,50%,40%)] to-[hsl(170,50%,45%)]',
    },
    {
      icon: ArrowDownRight,
      label: t('totalImportValue'),
      value: formatRM(stats.totalImport),
      tooltip: t('tooltipImport'),
      gradient: 'from-[hsl(42,70%,50%)] to-[hsl(30,60%,50%)]',
    },
    {
      icon: Scale,
      label: t('tradeBalance'),
      value: formatRM(stats.tradeBalance),
      tooltip: t('tooltipTradeBalance'),
      gradient: stats.tradeBalance >= 0
        ? 'from-[hsl(155,50%,40%)] to-[hsl(187,72%,42%)]'
        : 'from-[hsl(0,65%,55%)] to-[hsl(30,60%,50%)]',
      valueColor: stats.tradeBalance >= 0 ? 'text-[hsl(155,50%,40%)]' : 'text-destructive',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Row 1: 4 main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card/80 backdrop-blur-sm shadow-sm p-4 relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-[0.07]`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="w-5 h-5 text-primary" />
                </div>
                <InfoTooltip text={kpi.tooltip} />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className={`text-lg font-bold truncate ${kpi.valueColor || 'text-foreground'}`}>{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 2: Top 3 States + Top 3 Commodities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Top 3 States */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card/80 backdrop-blur-sm shadow-sm p-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,50%,55%)] to-[hsl(280,40%,55%)] opacity-[0.07]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-foreground">{t('top3States')}</p>
            </div>
            <div className="space-y-2">
              {stats.top3States.map(([name, value], i) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary w-4">{i + 1}</span>
                    <span className="text-xs text-foreground font-medium">{name}</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{formatRM(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top 3 Commodities */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-card/80 backdrop-blur-sm shadow-sm p-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(42,70%,50%)] to-[hsl(340,55%,50%)] opacity-[0.07]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-foreground">{t('top3Commodities')}</p>
            </div>
            <div className="space-y-2">
              {stats.top3Commodities.map(([name, value], i) => (
                <div key={name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-primary w-4 shrink-0">{i + 1}</span>
                    <span className="text-xs text-foreground font-medium truncate">{name}</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">{formatRM(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
