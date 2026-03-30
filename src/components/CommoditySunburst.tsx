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
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

// Shorten long commodity names for better display
function shortenName(name: string): string {
  const shortNames: Record<string, string> = {
    'KELUARAN PETROLEUM BERTAPIS': 'Petroleum',
    'BARANGAN ELEKTRIK DAN ELEKTRONIK': 'Elektrik & Elektronik',
    'ALAT-ALAT ELEKTRONIK': 'Alat Elektronik',
    'GAS ASLI CECAIR-LNG': 'Gas Asli (LNG)',
    'KRISTAL PIEZO ELEKTRIK & A': 'Kristal Piezo',
    'PERKAKAS LITAR': 'Perkakas Litar',
    'MINYAK KELAPA SAWIT': 'Minyak Sawit',
    'JENTERA & SARUNG TANGAN': 'Jentera',
    'PETROLEUM MENTAH': 'Petroleum Mentah',
    'PERABUT KAYU': 'Perabot Kayu',
    'PAKAIAN': 'Pakaian',
    'KELUARAN': 'Lain-lain Keluaran',
  };
  
  // Check if we have a short version
  for (const [long, short] of Object.entries(shortNames)) {
    if (name.includes(long) || long.includes(name)) {
      return short;
    }
  }
  
  // If name is too long (more than 25 chars), truncate
  if (name.length > 25) {
    return name.slice(0, 22) + '…';
  }
  
  return name;
}

function CustomContent({ x = 0, y = 0, width = 0, height = 0, name = '', index = 0, size = 0 }: any) {
  if (width < 45 || height < 32) return null;
  
  const shortName = shortenName(name);
  const maxChars = Math.floor(width / 8);
  const truncated = shortName.length > maxChars ? shortName.slice(0, maxChars) + '…' : shortName;
  const showValue = width > 80 && height > 50;

  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height} rx={6}
        fill={PALETTE[index % PALETTE.length]}
        stroke="hsl(var(--card))" strokeWidth={2}
        style={{ transition: 'all 0.2s' }}
      />
      <text
        x={x + width / 2} y={y + (showValue ? height * 0.4 : height / 2)}
        textAnchor="middle" dominantBaseline="central"
        fontSize={width > 100 ? 11 : width > 70 ? 9 : 8}
        fontWeight={600} fill="#fff" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        {truncated}
      </text>
      {showValue && (
        <text
          x={x + width / 2} y={y + height * 0.7}
          textAnchor="middle" dominantBaseline="central"
          fontSize={9} fontWeight={500} fill="rgba(255,255,255,0.85)"
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
    
    // Group and sum by commodity
    data.forEach(r => {
      const key = r.komoditiUtama || 'Lain-lain';
      map[key] = (map[key] || 0) + r.jumlahDaganganRM;
    });
    
    // Convert to array, sort by value (highest first)
    return Object.entries(map)
      .map(([name, size]) => ({ 
        name, 
        shortName: shortenName(name),
        size 
      }))
      .sort((a, b) => b.size - a.size);
  }, [data]);

  const total = useMemo(() => treemapData.reduce((a, b) => a + b.size, 0), [treemapData]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'hsl(var(--foreground))',
    padding: '8px 12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-foreground">
          {lang === 'bm' ? 'Peta Pokok Komoditi (SITC)' : 'Commodity Treemap (SITC)'}
        </h4>
        <span className="text-xs font-semibold text-primary">
          {lang === 'bm' ? 'Jumlah' : 'Total'}: {formatRM(total)}
        </span>
      </div>
      
      <ResponsiveContainer width="100%" height={420}>
        <Treemap 
          data={treemapData} 
          dataKey="size" 
          nameKey="name" 
          content={<CustomContent />}
          isAnimationActive={true}
          aspectRatio={1.2}
        >
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, _name: string, props: any) => {
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              const originalName = props?.payload?.name || '';
              const shortName = shortenName(originalName);
              return [
                `${formatRM(value)} (${pct}%)`,
                shortName,
              ];
            }}
          />
        </Treemap>
      </ResponsiveContainer>
      
      {/* Clean legend with short names and values */}
      <div className="mt-4 pt-2 border-t border-border">
        <p className="text-[10px] font-medium text-muted-foreground mb-2">
          {lang === 'bm' ? '📊 10 Komoditi Utama' : '📊 Top 10 Commodities'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {treemapData.slice(0, 12).map((item, i) => (
            <div key={item.name} className="flex items-center gap-2 text-[10px]">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
              />
              <span className="text-foreground truncate flex-1">
                {item.shortName}
              </span>
              <span className="text-primary font-medium shrink-0">
                {formatRM(item.size)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}