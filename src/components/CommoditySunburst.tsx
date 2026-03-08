import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { TradeRecord } from '@/data/mockTradeData';

const CATEGORY_RULES: { category: string; keywords: string[] }[] = [
  { category: 'E&E', keywords: ['elektrik', 'elektronik', 'litar'] },
  { category: 'Chemicals & Fuels', keywords: ['petroleum', 'oleokimia', 'kimia'] },
  { category: 'Wood & Furniture', keywords: ['kayu', 'perabut', 'gergaji'] },
];

function getParentCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) return rule.category;
  }
  return 'Others';
}

const PARENT_ORDER = ['E&E', 'Chemicals & Fuels', 'Wood & Furniture', 'Others'];

const COLORS = [
  '#1ab5c5', '#2db89a', '#3b82f6', '#14b8a6', '#6366f1',
  '#d4a017', '#8b5cf6', '#ec4899', '#f97316', '#65a30d',
];

interface Props {
  data: TradeRecord[];
}

export default function CommoditySunburst({ data }: Props) {
  const sunburstData = useMemo(() => {
    // Group original commodities into parent categories
    const parentMap: Record<string, Record<string, number>> = {};
    data.forEach(r => {
      const parent = getParentCategory(r.komoditiUtama);
      if (!parentMap[parent]) parentMap[parent] = {};
      parentMap[parent][r.komoditiUtama] = (parentMap[parent][r.komoditiUtama] || 0) + r.jumlahDaganganRM;
    });

    return PARENT_ORDER
      .filter(p => parentMap[p])
      .map((parent, i) => {
        const children = Object.entries(parentMap[parent]).sort((a, b) => b[1] - a[1]);
        const parentValue = children.reduce((s, [, v]) => s + v, 0);
        const color = COLORS[i % COLORS.length];

        return {
          name: parent,
          value: parentValue,
          itemStyle: { color },
          children: children.map(([name, value], j) => ({
            name,
            value,
            itemStyle: { color, opacity: 0.55 + (0.45 * (1 - j / children.length)) },
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
              show: false,
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 9,
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500,
              },
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
