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

// Ringkaskan nama komoditi dengan sokongan dwibahasa
function shortenName(name: string, lang: 'bm' | 'en'): string {
  const shortNames: Record<string, { bm: string; en: string }> = {
    'KELUARAN PETROLEUM BERTAPIS': { bm: 'Petroleum', en: 'Petroleum' },
    'BARANGAN ELEKTRIK DAN ELEKTRONIK': { bm: 'Elektrik & Elektronik', en: 'Electrical & Electronic' },
    'ALAT-ALAT ELEKTRONIK': { bm: 'Alat Elektronik', en: 'Electronic Equipment' },
    'GAS ASLI CECAIR-LNG': { bm: 'Gas Asli', en: 'Natural Gas' },
    'KRISTAL PIEZO ELEKTRIK & A': { bm: 'Kristal Piezo', en: 'Piezo Crystal' },
    'PERKAKAS LITAR': { bm: 'Perkakas Litar', en: 'Circuit Components' },
    'MINYAK KELAPA SAWIT': { bm: 'Minyak Sawit', en: 'Palm Oil' },
    'JENTERA & SARUNG TANGAN': { bm: 'Jentera', en: 'Machinery' },
    'PETROLEUM MENTAH': { bm: 'Petroleum Mentah', en: 'Crude Petroleum' },
    'PERABUT KAYU': { bm: 'Perabot Kayu', en: 'Wood Furniture' },
    'PAKAIAN': { bm: 'Pakaian', en: 'Apparel' },
    'KELUARAN': { bm: 'Lain-lain', en: 'Others' },
    'LAIN-LAIN': { bm: 'Lain-lain', en: 'Others' },
  };
  
  // Cari nama pendek
  for (const [long, short] of Object.entries(shortNames)) {
    if (name.includes(long) || long.includes(name)) {
      return short[lang];
    }
  }
  
  // Jika terlalu panjang, potong
  if (name.length > 25) {
    return name.slice(0, 22) + '…';
  }
  
  return name;
}

interface Props {
  data: TradeRecord[];
}

export default function CommoditySunburst({ data }: Props) {
  const { lang, t } = useLanguage();

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    
    data.forEach(r => {
      const key = r.komoditiUtama || 'LAIN-LAIN';
      map[key] = (map[key] || 0) + r.jumlahDaganganRM;
    });
    
    // Tukar ke array, susun ikut nilai tertinggi, ambil top 10
    return Object.entries(map)
      .map(([name, value]) => ({ 
        originalName: name,
        name: shortenName(name, lang),
        value 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [data, lang]);

  const total = useMemo(() => chartData.reduce((a, b) => a + b.value, 0), [chartData]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
    padding: '8px 12px',
    color: 'hsl(var(--foreground))',
  };

  // Teks berdasarkan bahasa
  const texts = {
    title: lang === 'bm' ? '10 Komoditi Utama' : 'Top 10 Commodities',
    total: lang === 'bm' ? 'Jumlah' : 'Total',
    value: lang === 'bm' ? 'Nilai (RM)' : 'Value (RM)',
    percentage: lang === 'bm' ? 'Peratusan' : 'Percentage',
    noData: lang === 'bm' ? 'Tiada data komoditi' : 'No commodity data',
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">{texts.noData}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-foreground">
          {texts.title}
        </h4>
        <span className="text-xs font-semibold text-primary">
          {texts.total}: {formatRM(total)}
        </span>
      </div>
      
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 110, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis 
            type="number" 
            tickFormatter={(v) => formatRM(v)} 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            label={{ 
              value: texts.value, 
              position: 'bottom', 
              fontSize: 10,
              fill: 'hsl(var(--muted-foreground))'
            }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={100}
            tick={{ fontSize: 11, fill: 'hsl(var(--foreground))', fontWeight: 500 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip 
            contentStyle={tooltipStyle}
            formatter={(value: number) => [formatRM(value), texts.value]}
            labelFormatter={(label) => `${label}`}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Ringkasan peratusan - dwibahasa */}
      <div className="mt-4 pt-2 border-t border-border">
        <p className="text-[10px] font-medium text-muted-foreground mb-2">
          📊 {texts.percentage}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {chartData.map((item, i) => {
            const percent = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={item.name} className="flex items-center gap-1.5">
                <span 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                />
                <span className="text-[10px] text-muted-foreground truncate flex-1">
                  {item.name}
                </span>
                <span className="text-[10px] text-primary font-medium">
                  {percent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Nota kaki */}
      <p className="text-[9px] text-muted-foreground text-center mt-3">
        {lang === 'bm' 
          ? '*Berdasarkan jumlah dagangan (eksport + import)' 
          : '*Based on total trade (export + import)'}
      </p>
    </div>
  );
}