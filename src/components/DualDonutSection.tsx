import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage, ENTERPRISE_LABEL_MAP } from '@/contexts/LanguageContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ENTERPRISE_COLORS = [
  'hsl(220, 60%, 25%)',   // Navy - Large
  'hsl(180, 55%, 42%)',   // Teal - Medium
  'hsl(155, 50%, 40%)',   // Emerald - Small
  'hsl(210, 25%, 72%)',   // Light Blue - Micro
  'hsl(215, 20%, 46%)',   // Slate - Agents
];

const REGION_COLORS = [
  'hsl(340, 55%, 50%)',   // Rose
  'hsl(42, 70%, 50%)',    // Gold
  'hsl(280, 40%, 55%)',   // Purple
  'hsl(160, 50%, 42%)',   // Green
  'hsl(200, 65%, 50%)',   // Blue
];

const ENTERPRISE_ORDER = ['LARGE', 'SME_MEDIUM', 'SME_SMALL', 'SME_MICRO', 'AGENTS'];

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

const REGION_MAP: Record<string, string> = {
  'SEMENANJUNG': 'semenanjung',
  'SABAH': 'sabah',
  'SARAWAK': 'sarawak',
  'ZON BEBAS': 'zonBebas',
};

interface Props {
  data: TradeRecord[];
}

export default function DualDonutSection({ data }: Props) {
  const { t, lang } = useLanguage();

  const enterpriseData = useMemo(() => {
    const totals: Record<string, number> = {};
    ENTERPRISE_ORDER.forEach(k => { totals[k] = 0; });
    data.forEach(r => { totals[r.keluasanSyarikat] = (totals[r.keluasanSyarikat] || 0) + r.jumlahDaganganRM; });
    return ENTERPRISE_ORDER.map(key => ({
      name: t(ENTERPRISE_LABEL_MAP[key] || key),
      value: totals[key] || 0,
    }));
  }, [data, t]);

  const regionData = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => {
      const k = r.kawasan?.toUpperCase()?.trim() || 'SEMENANJUNG';
      const label = REGION_MAP[k] || 'semenanjung';
      map[label] = (map[label] || 0) + r.jumlahDaganganRM;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({ name: t(key), value }));
  }, [data, t]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'hsl(var(--foreground))',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Enterprise Size Donut */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-foreground mb-1">{t('enterpriseStructure')}</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={enterpriseData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" nameKey="name" paddingAngle={3}>
              {enterpriseData.map((_, i) => (
                <Cell key={i} fill={ENTERPRISE_COLORS[i % ENTERPRISE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatRM(value), t('tradeValue')]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Economic Region Donut */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-foreground mb-1">{t('economicRegion')}</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={regionData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" nameKey="name" paddingAngle={3}>
              {regionData.map((_, i) => (
                <Cell key={i} fill={REGION_COLORS[i % REGION_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatRM(value), t('tradeValue')]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
