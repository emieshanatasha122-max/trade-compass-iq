import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useLanguage, ENTERPRISE_LABEL_MAP } from '@/contexts/LanguageContext';
import FilterBar from '@/components/FilterBar';
import InfoTooltip from '@/components/InfoTooltip';
import WorldMap from '@/components/WorldMap';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, LineChart, Line, Legend
} from 'recharts';
import StateFlagGrid from '@/components/StateFlagGrid';
import CommoditySunburst from '@/components/CommoditySunburst';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Download, Globe, Building2, Package, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = [
  'hsl(187, 72%, 42%)', 'hsl(170, 50%, 45%)', 'hsl(200, 65%, 50%)',
  'hsl(160, 50%, 42%)', 'hsl(220, 50%, 55%)', 'hsl(42, 70%, 50%)',
  'hsl(280, 40%, 55%)', 'hsl(340, 50%, 55%)', 'hsl(30, 60%, 50%)', 'hsl(100, 40%, 45%)'
];

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
  const { filteredData } = useFilters();
  const { t } = useLanguage();

  // KPIs
  const totalTrade = useMemo(() => filteredData.reduce((s, r) => s + r.jumlahDaganganRM, 0), [filteredData]);
  const totalExport = useMemo(() => filteredData.filter(r => r.jenisDagangan === 'Eksport').reduce((s, r) => s + r.jumlahDaganganRM, 0), [filteredData]);
  const totalImport = useMemo(() => filteredData.filter(r => r.jenisDagangan === 'Import').reduce((s, r) => s + r.jumlahDaganganRM, 0), [filteredData]);

  const topState = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.negeri] = (map[r.negeri] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  }, [filteredData]);

  // Trade Trends (yearly)
  const yearlyTrend = useMemo(() => {
    const map: Record<number, { export: number; import: number }> = {};
    filteredData.forEach(r => {
      if (!map[r.tahun]) map[r.tahun] = { export: 0, import: 0 };
      if (r.jenisDagangan === 'Eksport') map[r.tahun].export += r.jumlahDaganganRM;
      else map[r.tahun].import += r.jumlahDaganganRM;
    });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, vals]) => ({ year: Number(year), export: vals.export, import: vals.import, total: vals.export + vals.import }));
  }, [filteredData]);

  // State treemap data
  const stateTreemap = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.negeri] = (map[r.negeri] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Commodity data (top 10)
  const commodityData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.komoditiUtama] = (map[r.komoditiUtama] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({
        name: name.length > 16 ? name.slice(0, 16) + '…' : name,
        fullName: name,
        value,
      }));
  }, [filteredData]);

  // Export destinations
  const exportDestinations = useMemo(() => {
    const map: Record<string, { value: number; code: string }> = {};
    filteredData
      .filter(r => r.jenisDagangan === 'Eksport' && r.kodDestinasiEksportImport)
      .forEach(r => {
        const code = r.kodDestinasiEksportImport;
        if (!map[code]) map[code] = { value: 0, code };
        map[code].value += r.jumlahDaganganRM;
      });
    return map;
  }, [filteredData]);

  // Enterprise donut
  const enterpriseData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.keluasanSyarikat] = (map[r.keluasanSyarikat] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map).map(([key, value]) => ({
      key,
      name: t(ENTERPRISE_LABEL_MAP[key] || key),
      value,
    }));
  }, [filteredData, t]);

  const kpis = [
    { icon: TrendingUp, label: t('totalTradeValue'), value: formatRM(totalTrade), tooltip: t('tooltipTotalTrade'), trend: '+4.2%', positive: true },
    { icon: ArrowUpRight, label: t('totalExportValue'), value: formatRM(totalExport), tooltip: t('tooltipExport'), trend: '+3.8%', positive: true },
    { icon: ArrowDownRight, label: t('totalImportValue'), value: formatRM(totalImport), tooltip: t('tooltipImport'), trend: '+5.1%', positive: true },
    { icon: MapPin, label: t('topTradingState'), value: topState, tooltip: t('tooltipTopState'), trend: null, positive: true },
  ];

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'hsl(var(--foreground))',
  };

  return (
    <div className="space-y-8">
      <FilterBar />

      {/* Section 1: Trade Overview KPIs */}
      <section>
        <SectionHeader title={t('tradeOverview')} description={t('tradeOverviewDesc')} icon={TrendingUp} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="kpi-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <kpi.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</span>
                </div>
                <InfoTooltip text={kpi.tooltip} />
              </div>
              <p className="text-lg font-bold text-foreground truncate mt-1">{kpi.value}</p>
              {kpi.trend && (
                <span className={`text-[10px] font-medium ${kpi.positive ? 'text-primary' : 'text-decline'}`}>{kpi.trend} vs prev period</span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 2: Trade Trends Over Time */}
      <section>
        <SectionHeader title={t('tradeTrends')} description={t('tradeTrendsDesc')} icon={TrendingUp} />
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={yearlyTrend} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatRM(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatRM(value)]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="export" name={t('export')} stroke="hsl(var(--chart-export))" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="import" name={t('import')} stroke="hsl(var(--chart-gold))" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Section 3: Trade Activity by State (Flag Grid) */}
      <section>
        <SectionHeader title={t('stateActivity')} description={t('stateActivityDesc')} icon={MapPin} />
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-3">
            <InfoTooltip text={t('tooltipSupra')} />
          </div>
          <StateFlagGrid data={filteredData} />
        </div>
      </section>

      {/* Section 4: Commodity Structure (Sunburst) */}
      <section>
        <SectionHeader title={t('commodityStructure')} description={t('commodityStructureDesc')} icon={Package} />
        <div className="chart-container">
          <CommoditySunburst data={filteredData} />
        </div>
      </section>

      {/* Section 5: Global Trade Connections */}
      <section>
        <SectionHeader title={t('globalTradeMap')} description={t('globalTradeMapDesc')} icon={Globe} />
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-3">
            <InfoTooltip text={t('tooltipExportIntensity')} />
            <div className="ml-auto flex items-center gap-1 text-[10px] text-primary hover:underline cursor-pointer">
              <Download className="w-3 h-3" />
              {t('exportDashboard')}
            </div>
          </div>
          <WorldMap destinations={exportDestinations} />
        </div>
      </section>

      {/* Section 6: Enterprise Participation */}
      <section>
        <SectionHeader title={t('enterpriseParticipation')} description={t('enterpriseParticipationDesc')} icon={Building2} />
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-3">
            <InfoTooltip text={t('tooltipAgent')} />
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={enterpriseData} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value" nameKey="name" paddingAngle={3}>
                  {enterpriseData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatRM(value), t('tradeValue')]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 min-w-[160px]">
              {enterpriseData.map((d, i) => (
                <div key={d.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling end note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center py-6"
      >
        <p className="text-sm font-semibold gradient-text">{t('storyEnd')}</p>
      </motion.div>
    </div>
  );
}
