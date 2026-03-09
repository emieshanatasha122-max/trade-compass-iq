import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage, ENTERPRISE_LABEL_MAP } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

const ENTERPRISE_COLORS: Record<string, string> = {
  LARGE: 'hsl(220, 60%, 25%)',        // Navy Blue
  SME_MEDIUM: 'hsl(180, 55%, 42%)',   // Teal/Cyan
  SME_SMALL: 'hsl(155, 50%, 40%)',    // Emerald Green
  SME_MICRO: 'hsl(210, 25%, 72%)',    // Soft Light Blue
  AGENTS: 'hsl(215, 20%, 46%)',       // Slate
};

const ENTERPRISE_ORDER = ['LARGE', 'SME_MEDIUM', 'SME_SMALL', 'SME_MICRO', 'AGENTS'];

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

interface SliceData {
  key: string;
  value: number;
  pct: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

function describeArc(cx: number, cy: number, rOuter: number, rInner: number, startAngle: number, endAngle: number): string {
  const start1 = polarToCart(cx, cy, rOuter, endAngle);
  const end1 = polarToCart(cx, cy, rOuter, startAngle);
  const start2 = polarToCart(cx, cy, rInner, startAngle);
  const end2 = polarToCart(cx, cy, rInner, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${start1.x} ${start1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${end1.x} ${end1.y}`,
    `L ${start2.x} ${start2.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${end2.x} ${end2.y}`,
    'Z',
  ].join(' ');
}

function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

interface Props {
  data: TradeRecord[];
}

export default function EnterpriseDonut({ data }: Props) {
  const { t, lang } = useLanguage();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const slices = useMemo<SliceData[]>(() => {
    const totals: Record<string, number> = {};
    ENTERPRISE_ORDER.forEach(k => { totals[k] = 0; });
    data.forEach(r => { totals[r.keluasanSyarikat] = (totals[r.keluasanSyarikat] || 0) + r.jumlahDaganganRM; });

    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    let cumAngle = 0;

    return ENTERPRISE_ORDER.map(key => {
      const value = totals[key] || 0;
      const pct = (value / grandTotal) * 100;
      const sweep = (pct / 100) * 360;
      const slice: SliceData = {
        key,
        value,
        pct,
        color: ENTERPRISE_COLORS[key],
        startAngle: cumAngle,
        endAngle: cumAngle + sweep,
      };
      cumAngle += sweep;
      return slice;
    });
  }, [data]);

  const CX = 200;
  const CY = 200;
  const R_OUTER = 170;
  const R_INNER = 100;
  const SVG_SIZE = 400;

  const bilingualLabels: Record<string, { bm: string; en: string }> = {
    LARGE: { bm: 'Syarikat Besar', en: 'Large Enterprises' },
    SME_MEDIUM: { bm: 'PKS Sederhana', en: 'Medium SMEs' },
    SME_SMALL: { bm: 'PKS Kecil', en: 'Small SMEs' },
    SME_MICRO: { bm: 'PKS Mikro', en: 'Micro SMEs' },
    AGENTS: { bm: 'Ejen Perdagangan', en: 'Trading Agents' },
  };

  return (
    <div className="flex flex-col items-center w-full h-full justify-center">
      {/* Title */}
      <h3 className="text-sm font-bold text-foreground mb-1 text-center">
        {t('enterpriseParticipation')}
      </h3>
      <p className="text-[11px] text-muted-foreground mb-4 text-center max-w-[280px]">
        {t('enterpriseParticipationDesc')}
      </p>

      {/* Donut SVG */}
      <div className="relative w-full max-w-[340px] mx-auto">
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-auto">
          {slices.map((slice, i) => {
            if (slice.pct < 0.1) return null;
            const isHovered = hoveredKey === slice.key;
            const gap = 1.2;
            return (
              <motion.path
                key={slice.key}
                d={describeArc(CX, CY, isHovered ? R_OUTER + 6 : R_OUTER, R_INNER, slice.startAngle + gap, slice.endAngle - gap)}
                fill={slice.color}
                opacity={hoveredKey && !isHovered ? 0.4 : 1}
                className="cursor-pointer transition-opacity duration-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: hoveredKey && !isHovered ? 0.4 : 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
                onMouseEnter={() => setHoveredKey(slice.key)}
                onMouseLeave={() => setHoveredKey(null)}
              />
            );
          })}

          {/* Center icon area */}
          <circle cx={CX} cy={CY} r={R_INNER - 8} fill="hsl(var(--card))" />
          <foreignObject x={CX - 20} y={CY - 28} width={40} height={40}>
            <div className="flex items-center justify-center w-full h-full">
              <Building2 className="w-8 h-8 text-primary opacity-60" />
            </div>
          </foreignObject>
          {hoveredKey ? (
            <>
              <text x={CX} y={CY + 20} textAnchor="middle" fontSize="12" fontWeight={700} fill="hsl(var(--foreground))">
                {slices.find(s => s.key === hoveredKey)?.pct.toFixed(1)}%
              </text>
              <text x={CX} y={CY + 34} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
                {formatRM(slices.find(s => s.key === hoveredKey)?.value || 0)}
              </text>
            </>
          ) : (
            <text x={CX} y={CY + 22} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
              {t('enterpriseStructure')}
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2.5 w-full max-w-[300px]">
        {slices.map(slice => {
          const label = bilingualLabels[slice.key];
          const isHovered = hoveredKey === slice.key;
          return (
            <div
              key={slice.key}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                isHovered ? 'bg-accent/60 shadow-sm' : 'hover:bg-accent/30'
              }`}
              onMouseEnter={() => setHoveredKey(slice.key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <div
                className="w-3.5 h-3.5 rounded-sm shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] leading-tight font-semibold ${isHovered ? 'text-foreground' : 'text-foreground/80'}`}>
                  {lang === 'bm' ? label.bm : label.en}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {lang === 'bm' ? label.en : label.bm}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[12px] font-bold text-foreground">{slice.pct.toFixed(1)}%</p>
                <p className="text-[10px] text-muted-foreground">{formatRM(slice.value)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
