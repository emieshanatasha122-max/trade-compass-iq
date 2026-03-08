import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { TradeRecord } from '@/data/mockTradeData';

const SITC_RULES: { category: string; label: string; keywords: string[] }[] = [
  { category: 'SITC 0-1', label: 'Makanan & Tembakau', keywords: ['makanan', 'tembakau', 'minuman', 'ikan', 'sayur', 'buah', 'gula', 'kopi', 'teh'] },
  { category: 'SITC 2-4', label: 'Bahan Mentah & Minyak/Lemak', keywords: ['getah', 'kelapa sawit', 'minyak sawit', 'oleokimia', 'bijih', 'kulit'] },
  { category: 'SITC 3', label: 'Bahan Api Mineral', keywords: ['petroleum', 'gas asli', 'arang batu', 'minyak mentah'] },
  { category: 'SITC 5', label: 'Bahan Kimia', keywords: ['kimia', 'farmaseutikal', 'baja', 'racun'] },
  { category: 'SITC 6', label: 'Barang Dikilang (Logam/Kayu)', keywords: ['logam', 'kayu', 'gergaji', 'perabut', 'rotan', 'kertas', 'simen', 'kaca'] },
  { category: 'SITC 7', label: 'Jentera & Alat Pengangkutan', keywords: ['elektrik', 'elektronik', 'litar', 'jentera', 'mesin', 'alat ganti', 'motokar', 'kapal'] },
  { category: 'SITC 8', label: 'Pelbagai Barang Dikilang', keywords: ['pakaian', 'tekstil', 'kasut', 'kekemasan', 'mainan', 'sukan', 'optik'] },
];

function getSITCCategory(name: string): { category: string; label: string } {
  const lower = name.toLowerCase();
  for (const rule of SITC_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) return { category: rule.category, label: rule.label };
  }
  return { category: 'SITC 9', label: 'Lain-lain' };
}

// Strict numerical order: SITC 0-1 starts at 12 o'clock, ending with SITC 9
const PARENT_ORDER = ['SITC 0-1', 'SITC 2-4', 'SITC 3', 'SITC 5', 'SITC 6', 'SITC 7', 'SITC 8', 'SITC 9'];

// Light teal → deep navy gradient following SITC 0→9 progression
const COLORS: Record<string, string> = {
  'SITC 0-1': '#5eead4',
  'SITC 2-4': '#2dd4bf',
  'SITC 3': '#14b8a6',
  'SITC 5': '#0d9488',
  'SITC 6': '#0e7490',
  'SITC 7': '#0369a1',
  'SITC 8': '#1e40af',
  'SITC 9': '#1e3a5f',
};

interface Props {
  data: TradeRecord[];
}

export default function CommoditySunburst({ data }: Props) {
  const sunburstData = useMemo(() => {
    const parentMap: Record<string, { label: string; children: Record<string, number> }> = {};

    data.forEach(r => {
      const { category, label } = getSITCCategory(r.komoditiUtama);
      if (!parentMap[category]) parentMap[category] = { label, children: {} };
      parentMap[category].children[r.komoditiUtama] =
        (parentMap[category].children[r.komoditiUtama] || 0) + r.jumlahDaganganRM;
    });

    return PARENT_ORDER
      .filter(p => parentMap[p])
      .map(cat => {
        const { label, children } = parentMap[cat];
        const entries = Object.entries(children).sort((a, b) => b[1] - a[1]);
        const parentValue = entries.reduce((s, [, v]) => s + v, 0);
        const color = COLORS[cat] || '#475569';

        return {
          name: `${cat}\n${label}`,
          value: parentValue,
          itemStyle: { color },
          children: entries.map(([name, value], j) => ({
            name,
            value,
            itemStyle: { color, opacity: 0.5 + 0.5 * (1 - j / Math.max(entries.length, 1)) },
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
        sort: null,
        startAngle: 90,
        emphasis: { focus: 'ancestor' },
        levels: [
          {},
          {
            r0: '15%',
            r: '55%',
            label: {
              show: true,
              fontSize: 9,
              fontWeight: 600,
              color: '#fff',
              rotate: 'tangential',
              overflow: 'truncate',
              width: 70,
              minAngle: 10,
            },
            itemStyle: { borderWidth: 2, borderColor: 'hsl(222, 47%, 11%)' },
          },
          {
            r0: '55%',
            r: '90%',
            label: { show: false },
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