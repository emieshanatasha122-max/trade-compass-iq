import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/mockTradeData';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import {
  Utensils, Wine, Leaf, Fuel, Droplets, FlaskConical,
  Hammer, Cpu, ShirtIcon, Package
} from 'lucide-react';
import EnterpriseDonut from './EnterpriseDonut';

const SITC_ICONS = [Utensils, Wine, Leaf, Fuel, Droplets, FlaskConical, Hammer, Cpu, ShirtIcon, Package];
const SITC_LANG_KEYS = ['sitc0','sitc1','sitc2','sitc3','sitc4','sitc5','sitc6','sitc7','sitc8','sitc9'];

const SITC_RULES: { code: string; num: number; keywords: string[] }[] = [
  { code: 'SITC 0', num: 0, keywords: ['makanan', 'ikan', 'sayur', 'buah', 'gula', 'kopi', 'teh', 'beras', 'daging', 'susu', 'telur', 'rempah', 'gandum'] },
  { code: 'SITC 1', num: 1, keywords: ['tembakau', 'minuman', 'rokok'] },
  { code: 'SITC 2', num: 2, keywords: ['getah asli', 'bijih', 'kulit', 'bulu', 'kayu kumai', 'kayu balak', 'sisa logam'] },
  { code: 'SITC 3', num: 3, keywords: ['petroleum', 'gas asli', 'arang batu', 'minyak mentah', 'lng', 'gas cecair'] },
  { code: 'SITC 4', num: 4, keywords: ['kelapa sawit', 'minyak sawit', 'oleokimia', 'minyak kelapa', 'lemak'] },
  { code: 'SITC 5', num: 5, keywords: ['kimia', 'farmaseutikal', 'baja', 'racun', 'plastik', 'polimer'] },
  { code: 'SITC 6', num: 6, keywords: ['logam', 'kayu gergaji', 'perabut', 'rotan', 'kertas', 'simen', 'kaca', 'besi', 'keluli', 'tembaga', 'aluminium', 'getah dikilang', 'permaidani'] },
  { code: 'SITC 7', num: 7, keywords: ['elektrik', 'elektronik', 'litar', 'jentera', 'mesin', 'alat ganti', 'motokar', 'kapal', 'telekomunikasi', 'pendingin', 'pemprosesan data', 'piezo', 'pengangkutan', 'kelengkapan pejabat'] },
  { code: 'SITC 8', num: 8, keywords: ['pakaian', 'tekstil', 'kasut', 'kekemasan', 'mainan', 'sukan', 'optik', 'jam', 'kemas', 'permata', 'perabot', 'alat muzik', 'fotografi'] },
  { code: 'SITC 9', num: 9, keywords: [] },
];

function getSITCCode(name: string): string {
  const lower = name.toLowerCase();
  for (const rule of SITC_RULES) {
    if (rule.keywords.length > 0 && rule.keywords.some(k => lower.includes(k))) return rule.code;
  }
  return 'SITC 9';
}

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

// Normalize kawasan from CSV to display format
function normalizeKawasan(k: string): string {
  const map: Record<string, string> = { 'SEMENANJUNG': 'Semenanjung', 'SABAH': 'Sabah', 'SARAWAK': 'Sarawak', 'ZON BEBAS': 'Zon Bebas' };
  return map[k?.toUpperCase()] || k || 'Semenanjung';
}

interface SITCItem { code: string; num: number; total: number; topState: string; topRegion: string }

// Radar geometry
const CX = 350;
const CY = 350;
const R_MAX = 260;
const R_GRID = [0.2, 0.4, 0.6, 0.8, 1.0];
const LABEL_R = R_MAX + 52;
const ICON_R = R_MAX + 28;
const SVG_SIZE = CX * 2;

function polarToXY(angle: number, r: number): [number, number] {
  const rad = (angle - 90) * (Math.PI / 180);
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function RadarTooltipCard({
  item, x, y, maxVal, t
}: { item: SITCItem; x: number; y: number; maxVal: number; t: (k: string) => string }) {
  const Icon = SITC_ICONS[item.num] || Package;
  const pct = maxVal > 0 ? ((item.total / maxVal) * 100).toFixed(1) : '0';
  const label = t(SITC_LANG_KEYS[item.num]);

  const tooltipX = x > CX ? x - 240 : x + 16;
  const tooltipY = y > CY ? y - 140 : y + 16;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="absolute z-50 w-[230px] rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-2xl p-3.5"
      style={{ left: tooltipX, top: tooltipY }}
    >
      <div className="flex items-center gap-2.5 mb-2.5 pb-2 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <p className="text-[12px] font-bold text-foreground leading-snug">{item.code}: {label}</p>
      </div>
      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('radarTotalTrade')}</span>
          <span className="font-bold text-primary">{formatRM(item.total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('radarContribution')}</span>
          <span className="font-semibold text-foreground">{pct}%</span>
        </div>
        <div className="border-t border-border pt-2 mt-2">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">{t('radarTopAttributes')}</p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('radarPrimaryState')}</span>
            <span className="font-medium text-foreground">{item.topState}</span>
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-muted-foreground">{t('radarRegion')}</span>
            <span className="font-medium text-foreground">{item.topRegion}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface Props { data: TradeRecord[] }

export default function CommoditySunburst({ data }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { t } = useLanguage();

  const sitcItems = useMemo<SITCItem[]>(() => {
    const grouped: Record<string, TradeRecord[]> = {};
    SITC_RULES.forEach(r => { grouped[r.code] = []; });
    data.forEach(rec => { grouped[getSITCCode(rec.komoditiUtama)].push(rec); });

    return SITC_RULES.map(rule => {
      const records = grouped[rule.code];
      const total = records.reduce((s, r) => s + r.jumlahDaganganRM, 0);
      const stateMap: Record<string, number> = {};
      records.forEach(r => { stateMap[r.negeri] = (stateMap[r.negeri] || 0) + r.jumlahDaganganRM; });
      const topState = Object.entries(stateMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Selangor';
      const regionMap: Record<string, number> = {};
      records.forEach(r => { const rg = normalizeKawasan(r.kawasan); regionMap[rg] = (regionMap[rg] || 0) + r.jumlahDaganganRM; });
      const topRegion = Object.entries(regionMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Semenanjung';
      return { code: rule.code, num: rule.num, total, topState, topRegion };
    });
  }, [data]);

  const maxVal = useMemo(() => Math.max(...sitcItems.map(s => s.total), 1), [sitcItems]);

  const N = sitcItems.length;
  const angleStep = 360 / N;

  const dataPoints = sitcItems.map((item, i) => {
    const angle = i * angleStep;
    const r = (item.total / maxVal) * R_MAX;
    const [x, y] = polarToXY(angle, Math.max(r, R_MAX * 0.05));
    return { x, y, angle, item };
  });

  const polygonPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const gridLabels = R_GRID.map(pct => ({
    value: formatRM(maxVal * pct),
    r: R_MAX * pct,
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left column: Radar Chart (60%) */}
      <div className="w-full lg:w-[60%]">
        <div className="relative w-full max-w-[520px] mx-auto">
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-auto">
            {/* Concentric grid circles */}
            {R_GRID.map((pct, i) => (
              <circle
                key={i}
                cx={CX} cy={CY}
                r={R_MAX * pct}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth={i === R_GRID.length - 1 ? 1 : 0.5}
                strokeDasharray={i < R_GRID.length - 1 ? '4 4' : 'none'}
                opacity={0.45}
              />
            ))}

            {/* Axis lines */}
            {sitcItems.map((_, i) => {
              const angle = i * angleStep;
              const [x, y] = polarToXY(angle, R_MAX);
              return (
                <line
                  key={i}
                  x1={CX} y1={CY} x2={x} y2={y}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  opacity={0.35}
                />
              );
            })}

            {/* Data polygon */}
            <motion.path
              d={polygonPath}
              fill="hsl(var(--primary) / 0.14)"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              strokeLinejoin="round"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            />

            {/* Data points */}
            {dataPoints.map((dp, i) => (
              <motion.circle
                key={i}
                cx={dp.x} cy={dp.y}
                r={hoveredIdx === i ? 7 : 4.5}
                fill={hoveredIdx === i ? 'hsl(var(--primary))' : 'hsl(var(--background))'}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                className="cursor-pointer"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.04 * i }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}

            {/* Axis icons + labels */}
            {sitcItems.map((item, i) => {
              const angle = i * angleStep;
              const [ix, iy] = polarToXY(angle, ICON_R);
              const [lx, ly] = polarToXY(angle, LABEL_R);
              const isLeft = lx < CX - 30;
              const isRight = lx > CX + 30;
              const anchor = isLeft ? 'end' : isRight ? 'start' : 'middle';
              const isHovered = hoveredIdx === i;
              const Icon = SITC_ICONS[item.num] || Package;

              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <circle
                    cx={ix} cy={iy} r={12}
                    fill={isHovered ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--secondary) / 0.5)'}
                    stroke={isHovered ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                    strokeWidth={1}
                  />
                  <foreignObject x={ix - 7} y={iy - 7} width={14} height={14}>
                    <div className="flex items-center justify-center w-full h-full">
                      <Icon className={`w-3 h-3 ${isHovered ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </foreignObject>
                  <text
                    x={lx} y={ly}
                    fontSize="11"
                    fontWeight={isHovered ? 700 : 600}
                    fill={isHovered ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                  >
                    {item.code}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hoveredIdx !== null && (() => {
            const dp = dataPoints[hoveredIdx];
            const pctX = (dp.x / SVG_SIZE) * 520;
            const pctY = (dp.y / SVG_SIZE) * 520;
            return (
              <RadarTooltipCard
                item={dp.item}
                x={pctX}
                y={pctY}
                maxVal={maxVal}
                t={t}
              />
            );
          })()}
        </div>
      </div>

      {/* Right column: Enterprise Donut (40%) */}
      <div className="w-full lg:w-[40%] lg:border-l border-border lg:pl-6">
        <EnterpriseDonut data={data} />
      </div>
    </div>
  );
}
