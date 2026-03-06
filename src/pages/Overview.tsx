import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import FilterBar from '@/components/FilterBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { TrendingUp, MapPin, Package, Building2, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['hsl(187, 92%, 55%)', 'hsl(200, 80%, 50%)', 'hsl(160, 60%, 45%)', 'hsl(220, 60%, 60%)'];

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

export default function Overview() {
  const { filteredData } = useFilters();
  const { t } = useLanguage();

  const totalTrade = useMemo(() => filteredData.reduce((s, r) => s + r.jumlahDaganganRM, 0), [filteredData]);

  const topState = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.negeri] = (map[r.negeri] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  }, [filteredData]);

  const topCommodity = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.komoditiUtama] = (map[r.komoditiUtama] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  }, [filteredData]);

  const smePercent = useMemo(() => {
    const sme = filteredData.filter(r => r.keluasanSyarikat === 'PKS').reduce((s, r) => s + r.jumlahDaganganRM, 0);
    return totalTrade ? ((sme / totalTrade) * 100).toFixed(1) : '0';
  }, [filteredData, totalTrade]);

  const stateData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.negeri] = (map[r.negeri] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name: name.length > 12 ? name.slice(0, 12) + '…' : name, value, fullName: name }));
  }, [filteredData]);

  const enterpriseData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.keluasanSyarikat] = (map[r.keluasanSyarikat] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const kpis = [
    { icon: TrendingUp, label: t('totalTradeValue'), value: formatRM(totalTrade), color: 'text-primary' },
    { icon: MapPin, label: t('topState'), value: topState, color: 'text-chart-3' },
    { icon: Package, label: t('topCommodity'), value: topCommodity, color: 'text-chart-4' },
    { icon: Building2, label: t('smeContribution'), value: `${smePercent}%`, color: 'text-chart-5' },
  ];

  return (
    <div>
      <FilterBar />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="kpi-card">
            <div className="flex items-center gap-2">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className="text-lg font-bold text-foreground truncate">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trade by State Bar Chart */}
        <div className="lg:col-span-2 chart-container">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">{t('tradeByState')}</h3>
            <button className="flex items-center gap-1 text-[10px] text-primary hover:underline">
              <Download className="w-3 h-3" />
              {t('exportDashboard')}
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stateData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} tickFormatter={v => formatRM(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} width={100} />
              <Tooltip
                contentStyle={{ background: 'hsl(222, 47%, 14%)', border: '1px solid hsl(222, 30%, 22%)', borderRadius: '8px', fontSize: '11px', color: 'hsl(210, 40%, 98%)' }}
                formatter={(value: number) => [formatRM(value), t('tradeValue')]}
              />
              <Bar dataKey="value" fill="hsl(187, 92%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Enterprise Structure Donut */}
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('enterpriseStructure')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={enterpriseData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                {enterpriseData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'hsl(222, 47%, 14%)', border: '1px solid hsl(222, 30%, 22%)', borderRadius: '8px', fontSize: '11px', color: 'hsl(210, 40%, 98%)' }}
                formatter={(value: number) => [formatRM(value), t('tradeValue')]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {enterpriseData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
