import React, { useMemo, useState, useCallback } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, Legend,
} from 'recharts';
import { ArrowLeft, BarChart3 } from 'lucide-react';

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

const MONTH_LABELS_BM = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
const MONTH_LABELS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props {
  data: TradeRecord[];
}

export default function TrendDrillDown({ data }: Props) {
  const { t, lang } = useLanguage();
  const [drillYear, setDrillYear] = useState<number | null>(null);

  const yearlyData = useMemo(() => {
    const map: Record<number, { export: number; import: number }> = {};
    data.forEach(r => {
      if (!map[r.tahun]) map[r.tahun] = { export: 0, import: 0 };
      if (r.jenisDagangan === 'Eksport') map[r.tahun].export += r.jumlahDaganganRM;
      else map[r.tahun].import += r.jumlahDaganganRM;
    });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, vals]) => ({
        label: String(year),
        year: Number(year),
        export: vals.export,
        import: vals.import,
      }));
  }, [data]);

  const monthlyData = useMemo(() => {
    if (!drillYear) return [];
    const map: Record<number, { export: number; import: number }> = {};
    data.forEach(r => {
      if (r.tahun !== drillYear) return;
      if (!map[r.bulan]) map[r.bulan] = { export: 0, import: 0 };
      if (r.jenisDagangan === 'Eksport') map[r.bulan].export += r.jumlahDaganganRM;
      else map[r.bulan].import += r.jumlahDaganganRM;
    });
    const months = lang === 'bm' ? MONTH_LABELS_BM : MONTH_LABELS_EN;
    return Array.from({ length: 12 }, (_, i) => i + 1)
      .filter(m => map[m])
      .map(m => ({
        label: months[m - 1],
        export: map[m].export,
        import: map[m].import,
      }));
  }, [data, drillYear, lang]);

  const handleYearClick = useCallback((data: any) => {
    if (data?.activePayload?.[0]?.payload?.year) {
      setDrillYear(data.activePayload[0].payload.year);
    }
  }, []);

  const chartData = drillYear ? monthlyData : yearlyData;
  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'hsl(var(--foreground))',
  };

  const insightText = drillYear
    ? (lang === 'bm'
        ? `Pecahan bulanan untuk tahun ${drillYear} menunjukkan corak musiman dagangan. Bandingkan kemuncak eksport dan import untuk mengenal pasti bulan paling aktif.`
        : `The monthly breakdown for ${drillYear} reveals seasonal trade patterns. Compare export and import peaks to identify the most active months.`)
    : (lang === 'bm'
        ? 'Eksport menunjukkan trend peningkatan yang konsisten dan mencapai kemuncak pada tahun 2022 sebelum menurun sedikit pada tahun berikutnya. Import pula kekal lebih rendah sepanjang tempoh ini, mengekalkan imbangan dagangan yang positif.'
        : 'Exports show a consistent upward trend, reaching a peak in 2022 before slightly declining in the following year. Imports remain lower throughout the period, maintaining a positive trade balance.');

  return (
    <div>
      {drillYear && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setDrillYear(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {lang === 'bm' ? 'Kembali ke Tahunan' : 'Back to Yearly'}
          </button>
          <span className="text-sm font-bold text-primary">{drillYear}</span>
          <span className="text-xs text-muted-foreground">
            {lang === 'bm' ? '— Pecahan Bulanan' : '— Monthly Breakdown'}
          </span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={chartData}
          margin={{ left: 10, right: 20, top: 10, bottom: 5 }}
          onClick={drillYear ? undefined : handleYearClick}
          style={drillYear ? undefined : { cursor: 'pointer' }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatRM(v)} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatRM(value)]} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
          <Line type="linear" dataKey="export" name={t('export')} stroke="hsl(160, 60%, 45%)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={800} />
          <Line type="linear" dataKey="import" name={t('import')} stroke="hsl(0, 70%, 55%)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={800} />
        </LineChart>
      </ResponsiveContainer>

      {!drillYear && (
        <p className="text-[11px] text-muted-foreground text-center mt-1">
          {lang === 'bm' ? 'Klik pada titik tahun untuk melihat pecahan bulanan' : 'Click a year point to drill into the monthly breakdown'}
        </p>
      )}

      <div className="mt-4 flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
        <BarChart3 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          {insightText}
        </p>
      </div>
    </div>
  );
}
