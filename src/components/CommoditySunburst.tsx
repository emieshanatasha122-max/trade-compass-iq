import React, { useMemo } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PALETTE = [
  'hsl(220, 55%, 40%)', 'hsl(187, 65%, 42%)', 'hsl(155, 50%, 40%)',
  'hsl(42, 70%, 50%)', 'hsl(340, 55%, 50%)', 'hsl(280, 40%, 50%)',
  'hsl(200, 65%, 45%)', 'hsl(30, 60%, 45%)', 'hsl(170, 50%, 40%)',
  'hsl(100, 40%, 42%)',
];

function formatRM(value: number): string {
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

// Ringkaskan nama komoditi
function shortenName(name: string): string {
  const shortNames: Record<string, string> = {
    'KELUARAN PETROLEUM BERTAPIS': 'Petroleum',
    'BARANGAN ELEKTRIK DAN ELEKTRONIK': 'Elektrik & Eletronik',
    'ALAT-ALAT ELEKTRONIK': 'Alat Elektronik',
    'GAS ASLI CECAIR-LNG': 'Gas Asli',
    'KRISTAL PIEZO ELEKTRIK & A': 'Kristal Piezo',
    'PERKAKAS LITAR': 'Perkakas Litar',
    'MINYAK KELAPA SAWIT': 'Minyak Sawit',
    'JENTERA & SARUNG TANGAN': 'Jentera',
    'PETROLEUM MENTAH': 'Petroleum Mentah',
    'PERABUT KAYU': 'Perabot Kayu',
    'PAKAIAN': 'Pakaian',
    'KELUARAN': 'Lain-lain',
  };
  
  for (const [long, short] of Object.entries(shortNames)) {
    if (name.includes(long) || long.includes(name)) {
      return short;
    }
  }
  
  if (name.length > 20) {
    return name.slice(0, 18) + '…';
  }
  return name;
}

interface Props {
  data: TradeRecord[];
}

export default function CommoditySunburst({ data }: Props) {
  const { lang } = useLanguage();

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    
    data.forEach(r => {
      const key = r.komoditiUtama || 'Lain-lain';
      map[key] = (map[key] || 0) + r.jumlahDaganganRM;
    });
    
    // Tukar ke array, susun ikut nilai tertinggi, ambil top 10
    return Object.entries(map)
      .map(([name, value]) => ({ 
        name: shortenName(name),
        originalName: name,
        value 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Ambil 10 teratas sahaja
  }, [data]);

  const total = useMemo(() => chartData.reduce((a, b) => a + b.value, 0), [chartData]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
    padding: '8px 12px',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-foreground">
          {lang === 'bm' ? '10 Komoditi Utama' : 'Top 10 Commodities'}
        </h4>
        <span className="text-xs font-semibold text-primary">
          {lang === 'bm' ? 'Jumlah' : 'Total'}: {formatRM(total)}
        </span>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" tickFormatter={(v) => formatRM(v)} stroke="hsl(var(--muted-foreground))" />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={100}
            tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip 
            contentStyle={tooltipStyle}
            formatter={(value: number) => [formatRM(value), lang === 'bm' ? 'Nilai' : 'Value']}
            labelFormatter={(label) => `${label}`}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Ringkasan peratusan */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px]">
        {chartData.slice(0, 5).map((item, i) => {
          const percent = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={item.name} className="flex items-center gap-1">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
              />
              <span className="text-muted-foreground truncate">{item.name}</span>
              <span className="text-primary font-medium">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}