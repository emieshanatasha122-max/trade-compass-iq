import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

function truncateLabel(name: string, max = 18): string {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

type ChartMode = 'total' | 'export' | 'import';

interface Props {
  data: TradeRecord[];
}

export default function TopCountryBars({ data }: Props) {
  const { lang } = useLanguage();
  const [mode, setMode] = useState<ChartMode>('total');

  const chartData = useMemo(() => {
    const exportMap: Record<string, number> = {};
    const importMap: Record<string, number> = {};

    data.forEach((r) => {
      if (r.jenisDagangan === 'Eksport') {
        const country = r.destinasiEksport || 'Unknown';
        exportMap[country] = (exportMap[country] || 0) + r.jumlahDaganganRM;
      } else {
        const country = r.negaraAsal || 'Unknown';
        importMap[country] = (importMap[country] || 0) + r.jumlahDaganganRM;
      }
    });

    const allCountries = Array.from(
      new Set([...Object.keys(exportMap), ...Object.keys(importMap)])
    );

    return allCountries
      .map((country) => {
        const exportValue = exportMap[country] || 0;
        const importValue = importMap[country] || 0;
        const totalValue = exportValue + importValue;

        return {
          fullName: country,
          name: truncateLabel(country, 18),
          exportValue,
          importValue,
          totalValue,
        };
      })
      .sort((a, b) => {
        if (mode === 'export') return b.exportValue - a.exportValue;
        if (mode === 'import') return b.importValue - a.importValue;
        return b.totalValue - a.totalValue;
      })
      .slice(0, 10);
  }, [data, mode]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '10px',
    fontSize: '11px',
    color: 'hsl(var(--foreground))',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  };

  const chartTitle =
    mode === 'total'
      ? lang === 'bm'
        ? 'Top 10 Negara Rakan Dagang Utama'
        : 'Top 10 Trading Partners'
      : mode === 'export'
      ? lang === 'bm'
        ? 'Top 10 Destinasi Eksport Utama'
        : 'Top 10 Export Countries'
      : lang === 'bm'
      ? 'Top 10 Negara Asal Utama'
      : 'Top 10 Country of Origin';

  const chartDescription =
    mode === 'total'
      ? lang === 'bm'
        ? 'Ranking negara berdasarkan jumlah perdagangan keseluruhan (import + eksport)'
        : 'Country ranking based on total trade value (import + export)'
      : mode === 'export'
      ? lang === 'bm'
        ? 'Ranking negara berdasarkan nilai eksport'
        : 'Country ranking based on export value'
      : lang === 'bm'
      ? 'Ranking negara berdasarkan nilai import'
      : 'Country ranking based on import value';

  const dataKey =
    mode === 'total'
      ? 'totalValue'
      : mode === 'export'
      ? 'exportValue'
      : 'importValue';

  const fillColor =
    mode === 'total'
      ? 'hsl(210, 78%, 60%)'
      : mode === 'export'
      ? 'hsl(160, 60%, 45%)'
      : 'hsl(0, 70%, 55%)';

  const barLabel =
    mode === 'total'
      ? lang === 'bm'
        ? 'Jumlah Perdagangan'
        : 'Total Trade'
      : mode === 'export'
      ? lang === 'bm'
        ? 'Eksport'
        : 'Export'
      : lang === 'bm'
      ? 'Import'
      : 'Import';

  return (
    <div className="space-y-4">
      {/* Header + filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 className="text-sm font-bold text-foreground">{chartTitle}</h4>
          <p className="mt-1 text-xs text-muted-foreground">{chartDescription}</p>
        </div>

        <div className="inline-flex w-fit rounded-xl border border-border bg-background/50 p-1">
          <button
            onClick={() => setMode('total')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'total'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {lang === 'bm' ? 'Jumlah Perdagangan' : 'Total Trade'}
          </button>

          <button
            onClick={() => setMode('export')}
            className={`rounded-lg px-4 py-2 whitespace-nowrap text-xs font-medium transition-colors ${
              mode === 'export'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {lang === 'bm' ? 'Eksport' : 'Export'}
          </button>

          <button
            onClick={() => setMode('import')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'import'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {lang === 'bm' ? 'Import' : 'Import'}
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={380}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 20, left: 20, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            horizontal={true}
            vertical={false}
          />

          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => formatRM(v)}
          />

          <YAxis
            type="category"
            dataKey="name"
            width={50}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />

          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload;
              return item?.fullName || '';
            }}
            formatter={(value: number) => [formatRM(value), barLabel]}
          />

          <Bar
            dataKey={dataKey}
            name={barLabel}
            fill={fillColor}
            radius={[0, 6, 6, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}