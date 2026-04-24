import React, { useMemo, useState, useCallback } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line,
} from 'recharts';
import { ArrowLeft, BarChart3 } from 'lucide-react';

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

function formatYAxis(value: number): string {
  return (value / 1e9).toFixed(1);
}

const MONTH_LABELS_BM = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
const MONTH_LABELS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MONTH_FULL_BM = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
const MONTH_FULL_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Props {
  data: TradeRecord[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  const tooltipLabel = item?.tooltipLabel || label;

  const exportValue = payload.find((p: any) => p.dataKey === 'export')?.value;
  const importValue = payload.find((p: any) => p.dataKey === 'import')?.value;

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-lg">
      <p className="mb-2 font-semibold text-foreground">{tooltipLabel}</p>

      {exportValue !== undefined && (
        <p className="text-emerald-500">{formatRM(exportValue)}</p>
      )}

      {importValue !== undefined && (
        <p className="mt-1 text-orange-500">{formatRM(importValue)}</p>
      )}
    </div>
  );
}

export default function TrendDrillDown({ data }: Props) {
  const { t, lang } = useLanguage();
  const [drillYear, setDrillYear] = useState<number | null>(null);

  const yearlyData = useMemo(() => {
    const map: Record<number, { export: number; import: number }> = {};

    data.forEach((r) => {
      if (!map[r.tahun]) map[r.tahun] = { export: 0, import: 0 };

      if (r.jenisDagangan === 'Eksport') {
        map[r.tahun].export += r.jumlahDaganganRM;
      } else {
        map[r.tahun].import += r.jumlahDaganganRM;
      }
    });

    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, vals]) => ({
        label: String(year),
        year: Number(year),
        tooltipLabel: String(year),
        export: vals.export,
        import: vals.import,
      }));
  }, [data]);

  const monthlyData = useMemo(() => {
    if (!drillYear) return [];

    const map: Record<number, { export: number; import: number }> = {};

    data.forEach((r) => {
      if (r.tahun !== drillYear) return;

      if (!map[r.bulan]) map[r.bulan] = { export: 0, import: 0 };

      if (r.jenisDagangan === 'Eksport') {
        map[r.bulan].export += r.jumlahDaganganRM;
      } else {
        map[r.bulan].import += r.jumlahDaganganRM;
      }
    });

    const shortMonths = lang === 'bm' ? MONTH_LABELS_BM : MONTH_LABELS_EN;
    const fullMonths = lang === 'bm' ? MONTH_FULL_BM : MONTH_FULL_EN;

    return Array.from({ length: 12 }, (_, i) => i + 1)
      .filter((m) => map[m])
      .map((m) => ({
        label: shortMonths[m - 1],
        tooltipLabel: fullMonths[m - 1],
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

  const insightText = drillYear
    ? lang === 'bm'
      ? `Perincian bulanan untuk tahun ${drillYear} menunjukkan corak musiman Perdagangan. Bandingkan kemuncak eksport dan import untuk mengenal pasti bulan paling aktif.`
      : `The monthly breakdown for ${drillYear} reveals seasonal trade patterns. Compare export and import peaks to identify the most active months.`
    : lang === 'bm'
      ? 'Eksport menunjukkan trend peningkatan yang konsisten dan mencapai kemuncak pada tahun 2022 sebelum menurun sedikit pada tahun berikutnya. Import pula kekal lebih rendah sepanjang tempoh ini, mengekalkan imbangan Perdagangan yang positif.'
      : 'Exports show a consistent upward trend, reaching a peak in 2022 before slightly declining in the following year. Imports remain lower throughout the period, maintaining a positive trade balance.';

  return (
    <div>
      {drillYear ? (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrillYear(null)}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {lang === 'bm' ? 'Kembali ke Tahunan' : 'Back to Yearly'}
            </button>

            <span className="text-sm font-bold text-primary">{drillYear}</span>

            <span className="text-xs text-muted-foreground">
              {lang === 'bm' ? '— Perincian Bulanan' : '— Monthly Breakdown'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              {t('export')}
            </span>

            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E86A2A]" />
              {t('import')}
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-2 flex w-full justify-end pr-4">
          <div className="flex gap-3 text-xs text-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              {t('export')}
            </span>

            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E86A2A]" />
              {t('import')}
            </span>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={chartData}
          margin={{ left: 10, right: 20, top: 10, bottom: 20 }}
          onClick={drillYear ? undefined : handleYearClick}
          style={drillYear ? undefined : { cursor: 'pointer' }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.4}
            vertical={false}
          />

          <XAxis
            dataKey="label"
            label={{
              value: lang === 'bm' ? 'Tahun' : 'Year',
              position: 'insideBottom',
              offset: -10,
              style: {
                fontSize: 11,
                fill: 'hsl(var(--muted-foreground))',
              },
            }}
            tick={{
              fontSize: 11,
              fill: 'hsl(var(--muted-foreground))',
            }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
          />

          <YAxis
            label={{
              value: lang === 'bm' ? 'RM bilion' : 'RM billion',
              angle: -90,
              position: 'insideLeft',
              style: {
                fontSize: 11,
                fill: 'hsl(var(--muted-foreground))',
              },
            }}
            tick={{
              fontSize: 10,
              fill: 'hsl(var(--muted-foreground))',
            }}
            tickFormatter={formatYAxis}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="linear"
            dataKey="export"
            name={t('export')}
            stroke="hsl(160, 60%, 45%)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            animationDuration={800}
          />

          <Line
            type="linear"
            dataKey="import"
            name={t('import')}
            stroke="hsl(19, 70%, 55%)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
        <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          {insightText}
        </p>
      </div>
    </div>
  );
}