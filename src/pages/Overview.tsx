import React, { useMemo, useState } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useLanguage, ENTERPRISE_LABEL_MAP } from '@/contexts/LanguageContext';
import FilterBar from '@/components/FilterBar';
import InfoTooltip from '@/components/InfoTooltip';
import WorldMap from '@/components/WorldMap';
import StateFlagGrid from '@/components/StateFlagGrid';
import StateStackedAreaChart from '@/components/StateStackedAreaChart';
import CommodityStackedAreaChart from '@/components/CommodityStackedAreaChart';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Globe, Building2, Package, MapPin, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

function SectionHeader({ title, description, icon: Icon }: { title: string; description: string; icon?: React.ElementType }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        <h2 className="text-base font-bold text-foreground">{title}</h2>
      </div>
      <p className="section-description">{description}</p>
    </div>
  );
}

export default function Overview() {
  const { filteredData, isLoading } = useFilters();
  const { t, lang } = useLanguage();
  const [trendMode, setTrendMode] = useState<'yearly' | 'monthly'>('yearly');

  // KPIs
  const totalTrade = useMemo(() => filteredData.reduce((s, r) => s + r.jumlahDaganganRM, 0), [filteredData]);

  const topState = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.negeri] = (map[r.negeri] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  }, [filteredData]);

  const topCommodity = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.komoditiUtama] = (map[r.komoditiUtama] || 0) + r.jumlahDaganganRM; });
    const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    return top ? (top[0].length > 20 ? top[0].slice(0, 20) + '…' : top[0]) : '-';
  }, [filteredData]);

  const mainEnterprise = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.keluasanSyarikat] = (map[r.keluasanSyarikat] || 0) + r.jumlahDaganganRM; });
    const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    return top ? t(ENTERPRISE_LABEL_MAP[top[0]] || top[0]) : '-';
  }, [filteredData, t]);

  // Trade Trends
  const trendData = useMemo(() => {
    if (trendMode === 'yearly') {
      const map: Record<number, { export: number; import: number }> = {};
      filteredData.forEach(r => {
        if (!map[r.tahun]) map[r.tahun] = { export: 0, import: 0 };
        if (r.jenisDagangan === 'Eksport') map[r.tahun].export += r.jumlahDaganganRM;
        else map[r.tahun].import += r.jumlahDaganganRM;
      });
      return Object.entries(map)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([year, vals]) => ({ label: String(year), export: vals.export, import: vals.import }));
    } else {
      const map: Record<number, { export: number; import: number }> = {};
      filteredData.forEach(r => {
        if (!map[r.bulan]) map[r.bulan] = { export: 0, import: 0 };
        if (r.jenisDagangan === 'Eksport') map[r.bulan].export += r.jumlahDaganganRM;
        else map[r.bulan].import += r.jumlahDaganganRM;
      });
      return Array.from({ length: 12 }, (_, i) => i + 1)
        .filter(m => map[m])
        .map(m => ({ label: String(m), export: map[m].export, import: map[m].import }));
    }
  }, [filteredData, trendMode]);

  // Destinations with export/import split
  const exportDestinations = useMemo(() => {
    const map: Record<string, { value: number; code: string; topCommodity?: string; exportValue: number; importValue: number }> = {};
    const commodityMap: Record<string, Record<string, number>> = {};
    filteredData
      .filter(r => r.kodDestinasiEksportImport && r.kodDestinasiEksportImport !== 'MY')
      .forEach(r => {
        const code = r.kodDestinasiEksportImport;
        if (!map[code]) map[code] = { value: 0, code, exportValue: 0, importValue: 0 };
        map[code].value += r.jumlahDaganganRM;
        if (r.jenisDagangan === 'Eksport') map[code].exportValue += r.jumlahDaganganRM;
        else map[code].importValue += r.jumlahDaganganRM;
        if (!commodityMap[code]) commodityMap[code] = {};
        commodityMap[code][r.komoditiUtama] = (commodityMap[code][r.komoditiUtama] || 0) + r.jumlahDaganganRM;
      });
    Object.entries(commodityMap).forEach(([code, comms]) => {
      const top = Object.entries(comms).sort((a, b) => b[1] - a[1])[0];
      if (top && map[code]) map[code].topCommodity = top[0].length > 30 ? top[0].slice(0, 30) + '…' : top[0];
    });
    return map;
  }, [filteredData]);

  // Full country list for map filter (all unique countries from data)
  const allCountries = useMemo(() => {
    const set = new Map<string, string>();
    filteredData.forEach(r => {
      if (r.jenisDagangan === 'Eksport' && r.kodDestinasiEksportImport && r.kodDestinasiEksportImport !== 'MY') {
        set.set(r.kodDestinasiEksportImport, r.destinasiEksport);
      }
      if (r.jenisDagangan === 'Import' && r.kodDestinasiEksportImport && r.kodDestinasiEksportImport !== 'MY') {
        set.set(r.kodDestinasiEksportImport, r.negaraAsal);
      }
    });
    return Array.from(set.entries()).map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredData]);

  const kpis = [
    { icon: TrendingUp, label: t('totalTradeValue'), value: formatRM(totalTrade), tooltip: t('tooltipTotalTrade'), gradient: 'from-[hsl(187,72%,42%)] to-[hsl(200,65%,50%)]' },
    { icon: MapPin, label: t('topTradingState'), value: topState, tooltip: t('tooltipTopState'), gradient: 'from-[hsl(155,50%,40%)] to-[hsl(170,50%,45%)]' },
    { icon: Package, label: t('topSITCCategory'), value: topCommodity, tooltip: t('tooltipTopSITC'), gradient: 'from-[hsl(42,70%,50%)] to-[hsl(30,60%,50%)]' },
    { icon: Building2, label: t('mainEnterpriseSize'), value: mainEnterprise, tooltip: t('tooltipMainEnterprise'), gradient: 'from-[hsl(220,50%,55%)] to-[hsl(280,40%,55%)]' },
  ];

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'hsl(var(--foreground))',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">{t('loadingData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FilterBar />

      {/* SECTION 1: Trade Overview KPI Cards */}
      <section>
        <SectionHeader title={t('tradeOverview')} description={t('tradeOverviewDesc')} icon={TrendingUp} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card shadow-sm p-4 relative overflow-hidden"
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
                <p className="text-lg font-bold text-foreground truncate">{kpi.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Global Trade Mapping */}
      <section>
        <SectionHeader title={t('globalTradeMap')} description={t('globalTradeMapDesc')} icon={Globe} />
        <div className="chart-container">
          <WorldMap destinations={exportDestinations} allCountries={allCountries} />
        </div>
      </section>

      {/* SECTION 3: Trade Trend Analysis */}
      <section>
        <SectionHeader title={t('tradeTrends')} description={t('tradeTrendsDesc')} icon={BarChart3} />
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setTrendMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${trendMode === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {t('monthlyTrend')}
            </button>
            <button
              onClick={() => setTrendMode('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${trendMode === 'yearly' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {t('yearlyTrend')}
            </button>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatRM(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatRM(value)]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="export" name={t('export')} stroke="hsl(187, 72%, 42%)" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={800} />
              <Line type="monotone" dataKey="import" name={t('import')} stroke="hsl(42, 70%, 50%)" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* SECTION 4: Trade by State - Flags + Stacked Area */}
      <section>
        <SectionHeader title={t('stateActivity')} description={t('stateActivityDesc')} icon={MapPin} />
        <div className="chart-container mb-4">
          <StateFlagGrid data={filteredData} />
        </div>
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {lang === 'bm' ? 'Graf Garis Komponen Mengikut Negeri' : 'Stacked Area Chart by State'}
          </h3>
          <StateStackedAreaChart data={filteredData} />
        </div>
      </section>

      {/* SECTION 5: Commodity Analysis - Stacked Area */}
      <section>
        <SectionHeader
          title={lang === 'bm' ? 'Aliran Dagangan mengikut Komoditi' : 'Trade Flow by Commodity'}
          description={lang === 'bm' ? 'Evolusi dagangan mengikut kategori SITC sepanjang masa' : 'Evolution of trade by SITC category over time'}
          icon={Package}
        />
        <div className="chart-container">
          <CommodityStackedAreaChart data={filteredData} />
        </div>
      </section>


      {/* End note */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center py-6">
        <p className="text-sm font-semibold gradient-text">{t('storyEnd')}</p>
      </motion.div>
    </div>
  );
}
