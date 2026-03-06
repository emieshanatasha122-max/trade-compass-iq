import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import FilterBar from '@/components/FilterBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

function formatRM(v: number) {
  if (v >= 1e9) return `RM ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `RM ${(v / 1e6).toFixed(1)}M`;
  return `RM ${v.toLocaleString()}`;
}

export default function RegionalAnalysis() {
  const { filteredData } = useFilters();
  const { t } = useLanguage();

  const stateRanking = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.negeri] = (map[r.negeri] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const trendData = useMemo(() => {
    const map: Record<number, { eksport: number; import: number }> = {};
    filteredData.forEach(r => {
      if (!map[r.tahun]) map[r.tahun] = { eksport: 0, import: 0 };
      if (r.jenisDagangan === 'Eksport') map[r.tahun].eksport += r.jumlahDaganganRM;
      else map[r.tahun].import += r.jumlahDaganganRM;
    });
    return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0])).map(([year, vals]) => ({ year, ...vals }));
  }, [filteredData]);

  const tooltipStyle = { background: 'hsl(222, 47%, 14%)', border: '1px solid hsl(222, 30%, 22%)', borderRadius: '8px', fontSize: '11px', color: 'hsl(210, 40%, 98%)' };

  return (
    <div>
      <FilterBar />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('stateTradeRanking')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stateRanking} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} tickFormatter={v => formatRM(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215, 20%, 55%)' }} width={110} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatRM(v), t('tradeValue')]} />
              <Bar dataKey="value" fill="hsl(187, 92%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('tradeTrendByState')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} tickFormatter={v => formatRM(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatRM(v)]} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="eksport" stroke="hsl(187, 92%, 55%)" strokeWidth={2} dot={false} name={t('export')} />
              <Line type="monotone" dataKey="import" stroke="hsl(200, 80%, 50%)" strokeWidth={2} dot={false} name={t('import')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
