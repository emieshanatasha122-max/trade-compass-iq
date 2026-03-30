import React, { useMemo } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const PALETTE = [
  'hsl(220, 55%, 40%)', 'hsl(187, 65%, 42%)', 'hsl(155, 50%, 40%)',
  'hsl(42, 70%, 50%)', 'hsl(340, 55%, 50%)', 'hsl(280, 40%, 50%)',
  'hsl(200, 65%, 45%)', 'hsl(30, 60%, 45%)', 'hsl(170, 50%, 40%)',
  'hsl(100, 40%, 42%)', 'hsl(0, 55%, 48%)', 'hsl(260, 45%, 48%)',
];

function formatRM(value: number): string {
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

// Nama pendek untuk treemap (dwibahasa)
function getShortName(name: string, lang: 'bm' | 'en'): string {
  const shortNames: Record<string, { bm: string; en: string }> = {
    'KELUARAN PETROLEUM BERTAPIS': { bm: 'Petroleum', en: 'Petroleum' },
    'BARANGAN ELEKTRIK DAN ELEKTRONIK': { bm: 'E&E', en: 'E&E' },
    'ALAT-ALAT ELEKTRONIK': { bm: 'Alat Elektronik', en: 'Electronics' },
    'GAS ASLI CECAIR-LNG': { bm: 'Gas Asli', en: 'Natural Gas' },
    'KRISTAL PIEZO ELEKTRIK & A': { bm: 'Kristal Piezo', en: 'Piezo' },
    'PERKAKAS LITAR': { bm: 'Perkakas Litar', en: 'Circuits' },
    'MINYAK KELAPA SAWIT': { bm: 'Minyak Sawit', en: 'Palm Oil' },
    'JENTERA & SARUNG TANGAN': { bm: 'Jentera', en: 'Machinery' },
    'PETROLEUM MENTAH': { bm: 'Petroleum Mentah', en: 'Crude Oil' },
    'PERABUT KAYU': { bm: 'Perabot Kayu', en: 'Wood' },
    'PAKAIAN': { bm: 'Pakaian', en: 'Apparel' },
  };
  
  for (const [long, short] of Object.entries(shortNames)) {
    if (name.includes(long) || long.includes(name)) {
      return short[lang];
    }
  }
  
  if (name.length > 15) {
    return name.slice(0, 12) + '…';
  }
  return name;
}

function CustomContent({ x = 0, y = 0, width = 0, height = 0, name = '', index = 0, size = 0, lang = 'en' }: any) {
  if (width < 40 || height < 35) return null;
  
  const shortName = getShortName(name, lang);
  const maxChars = Math.floor(width / 9);
  const truncated = shortName.length > maxChars ? shortName.slice(0, maxChars) + '…' : shortName;
  const showValue = width > 70 && height > 45;

  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height} rx={6}
        fill={PALETTE[index % PALETTE.length]}
        stroke="hsl(var(--card))" strokeWidth={2}
      />
      <text
        x={x + width / 2} y={y + (showValue ? height * 0.4 : height / 2)}
        textAnchor="middle" dominantBaseline="central"
        fontSize={width > 90 ? 11 : width > 60 ? 9 : 8}
        fontWeight={600} fill="#fff"
      >
        {truncated}
      </text>
      {showValue && (
        <text
          x={x + width / 2} y={y + height * 0.7}
          textAnchor="middle" dominantBaseline="central"
          fontSize={8} fontWeight={500} fill="rgba(255,255,255,0.85)"
        >
          {formatRM(size)}
        </text>
      )}
    </g>
  );
}

interface Props {
  data: TradeRecord[];
}

export default function CommoditySunburst({ data }: Props) {
  const { lang } = useLanguage();

  const treemapData = useMemo(() => {
    const map: Record<string, number> = {};
    
    data.forEach(r => {
      const key = r.komoditiUtama || 'LAIN-LAIN';
      map[key] = (map[key] || 0) + r.jumlahDaganganRM;
    });
    
    // Ambil top 12 sahaja, selebihnya jadi "Lain-lain"
    const sorted = Object.entries(map)
      .map(([name, size]) => ({ name, size }))
      .sort((a, b) => b.size - a.size);
    
    const top12 = sorted.slice(0, 11);
    const others = sorted.slice(11);
    
    if (others.length > 0) {
      const othersTotal = others.reduce((sum, item) => sum + item.size, 0);
      top12.push({ name: 'LAIN-LAIN', size: othersTotal });
    }
    
    return top12;
  }, [data]);

  const total = useMemo(() => treemapData.reduce((a, b) => a + b.size, 0), [treemapData]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '11px',
    padding: '6px 10px',
  };

  const texts = {
    title: lang === 'bm' ? 'Peta Pokok Komoditi' : 'Commodity Treemap',
    total: lang === 'bm' ? 'Jumlah' : 'Total',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-foreground">{texts.title}</h4>
        <span className="text-xs text-primary font-medium">{texts.total}: {formatRM(total)}</span>
      </div>
      
      <ResponsiveContainer width="100%" height={380}>
        <Treemap 
          data={treemapData} 
          dataKey="size" 
          nameKey="name" 
          content={<CustomContent lang={lang} />}
          isAnimationActive={true}
        >
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [formatRM(value), lang === 'bm' ? 'Nilai' : 'Value']}
            labelFormatter={(name) => getShortName(name, lang)}
          />
        </Treemap>
      </ResponsiveContainer>
      
      {/* Legend ringkas */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {treemapData.slice(0, 6).map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
            <span className="text-[9px] text-muted-foreground">{getShortName(item.name, lang)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}