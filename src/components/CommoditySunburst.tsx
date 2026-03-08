import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { TradeRecord } from '@/data/mockTradeData';

const SUB_CATEGORIES: Record<string, string[]> = {
  'Elektrikal & Elektronik': ['Semikonduktor', 'Papan Litar', 'Peralatan Elektrik'],
  'Minyak Sawit': ['Minyak Mentah', 'Minyak Olahan', 'Oleokimia'],
  'Petroleum': ['Minyak Mentah', 'Gas Asli', 'Produk Petroleum'],
  'Jentera': ['Jentera Industri', 'Alat Ganti', 'Peralatan Berat'],
  'Getah': ['Getah Asli', 'Sarung Tangan', 'Produk Getah'],
  'Kimia': ['Kimia Organik', 'Kimia Tak Organik', 'Baja'],
  'Kayu': ['Kayu Balak', 'Papan Lapis', 'Perabot'],
  'Tekstil': ['Fabrik', 'Pakaian', 'Benang'],
  'Logam': ['Besi & Keluli', 'Aluminium', 'Tembaga'],
  'Makanan': ['Makanan Laut', 'Makanan Diproses', 'Minuman'],
};

const COLORS = [
  '#1ab5c5', '#2db89a', '#3b82f6', '#14b8a6', '#6366f1',
  '#d4a017', '#8b5cf6', '#ec4899', '#f97316', '#65a30d',
];

interface Props {
  data: TradeRecord[];
}

export default function CommoditySunburst({ data }: Props) {
  const sunburstData = useMemo(() => {
    const commodityMap: Record<string, number> = {};
    data.forEach(r => {
      commodityMap[r.komoditiUtama] = (commodityMap[r.komoditiUtama] || 0) + r.jumlahDaganganRM;
    });

    const total = Object.values(commodityMap).reduce((a, b) => a + b, 0);

    return Object.entries(commodityMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => {
        const subs = SUB_CATEGORIES[name] || ['Lain-lain'];
        const color = COLORS[i % COLORS.length];
        // Distribute value across sub-categories with variation
        const subTotal = subs.length;
        const weights = subs.map((_, j) => 1 / (j + 1));
        const weightSum = weights.reduce((a, b) => a + b, 0);

        return {
          name,
          value,
          itemStyle: { color },
          children: subs.map((sub, j) => ({
            name: sub,
            value: Math.round(value * (weights[j] / weightSum)),
            itemStyle: {
              color,
              opacity: 0.6 + (0.4 * (1 - j / subTotal)),
            },
          })),
        };
      });
  }, [data]);

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const val = params.value;
        const formatted = val >= 1e12 ? `RM ${(val / 1e12).toFixed(1)}T`
          : val >= 1e9 ? `RM ${(val / 1e9).toFixed(1)}B`
          : val >= 1e6 ? `RM ${(val / 1e6).toFixed(1)}M`
          : `RM ${val.toLocaleString()}`;
        const pct = params.percent ? `${params.percent.toFixed(1)}%` : '';
        return `<strong>${params.name}</strong><br/>${formatted} ${pct ? `(${pct})` : ''}`;
      },
      backgroundColor: 'hsl(222, 47%, 16%)',
      borderColor: 'hsl(217, 33%, 25%)',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
    },
    series: [
      {
        type: 'sunburst',
        data: sunburstData,
        radius: ['15%', '90%'],
        sort: undefined,
        emphasis: { focus: 'ancestor' },
        levels: [
          {},
          {
            r0: '15%',
            r: '55%',
            label: {
              show: true,
              fontSize: 10,
              fontWeight: 600,
              color: '#fff',
              rotate: 'tangential',
              overflow: 'truncate',
              width: 70,
            },
            itemStyle: { borderWidth: 2, borderColor: 'hsl(222, 47%, 11%)' },
          },
          {
            r0: '55%',
            r: '90%',
            label: {
              show: true,
              fontSize: 9,
              color: 'rgba(255,255,255,0.8)',
              position: 'outside',
              rotate: 'tangential',
              overflow: 'truncate',
              width: 60,
            },
            itemStyle: { borderWidth: 1, borderColor: 'hsl(222, 47%, 11%)' },
          },
        ],
      },
    ],
  }), [sunburstData]);

  return (
    <ReactECharts
      option={option}
      style={{ height: '420px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
