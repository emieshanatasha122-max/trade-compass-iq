import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import FilterBar from '@/components/FilterBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LineChart, Line, Legend } from 'recharts';

const COLORS = ['hsl(187, 92%, 55%)', 'hsl(200, 80%, 50%)', 'hsl(160, 60%, 45%)'];

function formatRM(v: number) {
  if (v >= 1e9) return `RM ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `RM ${(v / 1e6).toFixed(1)}M`;
  return `RM ${v.toLocaleString()}`;
}

export default function EnterpriseAnalysis() {
  const { filteredData } = useFilters();
  const { t } = useLanguage();

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.keluasanSyarikat] = (map[r.keluasanSyarikat] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const trendData = useMemo(() => {
    const map: Record<number, Record<string, number>> = {};
    filteredData.forEach(r => {
      if (!map[r.tahun]) map[r.tahun] = {};
      map[r.tahun][r.keluasanSyarikat] = (map[r.tahun][r.keluasanSyarikat] || 0) + r.jumlahDaganganRM;
    });
    return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0])).map(([year, vals]) => ({
      year, 'Perusahaan Besar': vals['Perusahaan Besar'] || 0, PKS: vals['PKS'] || 0, Mikro: vals['Mikro'] || 0,
    }));
  }, [filteredData]);

  const stackedData = useMemo(() => trendData, [trendData]);
  const tooltipStyle = { background: 'hsl(222, 47%, 14%)', border: '1px solid hsl(222, 30%, 22%)', borderRadius: '8px', fontSize: '11px', color: 'hsl(210, 40%, 98%)' };

  return (
    <div>
      <FilterBar />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('enterpriseStructure')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatRM(v)]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('enterpriseContribution')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stackedData} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} tickFormatter={v => formatRM(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatRM(v)]} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Perusahaan Besar" stackId="a" fill={COLORS[0]} />
              <Bar dataKey="PKS" stackId="a" fill={COLORS[1]} />
              <Bar dataKey="Mikro" stackId="a" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container mt-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('enterpriseTrend')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData} margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} tickFormatter={v => formatRM(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatRM(v)]} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" dataKey="Perusahaan Besar" stroke={COLORS[0]} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="PKS" stroke={COLORS[1]} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Mikro" stroke={COLORS[2]} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
