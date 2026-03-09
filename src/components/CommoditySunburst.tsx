import React, { useMemo, useState, useCallback } from 'react';
import type { TradeRecord } from '@/data/mockTradeData';
import { motion } from 'framer-motion';
import {
  Utensils, Wine, Leaf, Fuel, Droplets, FlaskConical,
  Hammer, Cpu, ShirtIcon, Package
} from 'lucide-react';

const SITC_ICONS = [Utensils, Wine, Leaf, Fuel, Droplets, FlaskConical, Hammer, Cpu, ShirtIcon, Package];

const SITC_RULES: { code: string; num: number; label: string; keywords: string[] }[] = [
  { code: 'SITC 0', num: 0, label: 'Makanan & Binatang Hidup', keywords: ['makanan', 'ikan', 'sayur', 'buah', 'gula', 'kopi', 'teh'] },
  { code: 'SITC 1', num: 1, label: 'Minuman & Tembakau', keywords: ['tembakau', 'minuman'] },
  { code: 'SITC 2', num: 2, label: 'Bahan Mentah Tak Boleh Dimakan', keywords: ['getah', 'bijih', 'kulit'] },
  { code: 'SITC 3', num: 3, label: 'Bahan Api Mineral & Pelincir', keywords: ['petroleum', 'gas asli', 'arang batu', 'minyak mentah'] },
  { code: 'SITC 4', num: 4, label: 'Minyak & Lemak Binatang/Tumbuhan', keywords: ['kelapa sawit', 'minyak sawit', 'oleokimia'] },
  { code: 'SITC 5', num: 5, label: 'Bahan Kimia & Produk Berkaitan', keywords: ['kimia', 'farmaseutikal', 'baja', 'racun'] },
  { code: 'SITC 6', num: 6, label: 'Barang Dikilang (Kayu, Logam, Getah)', keywords: ['logam', 'kayu', 'gergaji', 'perabut', 'rotan', 'kertas', 'simen', 'kaca'] },
  { code: 'SITC 7', num: 7, label: 'Jentera & Pengangkutan (E&E)', keywords: ['elektrik', 'elektronik', 'litar', 'jentera', 'mesin', 'alat ganti', 'motokar', 'kapal'] },
  { code: 'SITC 8', num: 8, label: 'Pelbagai Barang Dikilang', keywords: ['pakaian', 'tekstil', 'kasut', 'kekemasan', 'mainan', 'sukan', 'optik'] },
  { code: 'SITC 9', num: 9, label: 'Lain-lain Komoditi', keywords: [] },
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

const STATE_LIST = [
  'Selangor', 'Johor', 'Pulau Pinang', 'Sarawak', 'Sabah', 'Perak', 'Kedah',
  'Pahang', 'Kelantan', 'Terengganu', 'Melaka', 'Negeri Sembilan', 'Perlis',
  'W.P. Kuala Lumpur', 'W.P. Labuan', 'Supra', 'Agent',
];

const REGION_LIST = ['Semenanjung', 'Sabah', 'Sarawak', 'Zon Bebas'];

const STATE_TO_REGION: Record<string, string> = {
  'Sabah': 'Sabah', 'Sarawak': 'Sarawak',
  'W.P. Labuan': 'Zon Bebas', 'Supra': 'Zon Bebas', 'Agent': 'Zon Bebas',
};

function mapStateToRegion(s: string) { return STATE_TO_REGION[s] || 'Semenanjung'; }

interface SITCItem { code: string; num: number; label: string; total: number; topState: string; topRegion: string }

// Radar geometry helpers
const CX = 300;
const CY = 300;
const R_MAX = 220;
const R_GRID = [0.2, 0.4, 0.6, 0.8, 1.0];
const LABEL_R = R_MAX + 40;
const ICON_R = R_MAX + 68;

function polarToXY(angle: number, r: number): [number, number] {
  const rad = (angle - 90) * (Math.PI / 180);
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function RadarTooltipCard({
  item, x, y, maxVal
}: { item: SITCItem; x: number; y: number; maxVal: number }) {
  const Icon = SITC_ICONS[item.num] || Package;
  const pct = maxVal > 0 ? ((item.total / maxVal) * 100).toFixed(1) : '0';
  
  // Position tooltip to avoid going off-screen
  const tooltipX = x > CX ? x - 220 : x + 12;
  const tooltipY = y > CY ? y - 120 : y + 12;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute z-50 w-[210px] rounded-lg border border-border bg-card shadow-xl p-3"
      style={{ left: tooltipX, top: tooltipY }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <p className="text-xs font-bold text-foreground leading-tight">{item.code}: {item.label}</p>
      </div>
      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Jumlah Dagangan</span>
          <span className="font-bold text-primary">{formatRM(item.total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sumbangan</span>
          <span className="font-semibold text-foreground">{pct}%</span>
        </div>
        <div className="border-t border-border pt-1.5 mt-1.5">
          <p className="text-[10px] text-muted-foreground mb-0.5">Atribut Utama:</p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Negeri Utama</span>
            <span className="font-medium text-foreground">{item.topState}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kawasan</span>
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

  const sitcItems = useMemo<SITCItem[]>(() => {
    const grouped: Record<string, TradeRecord[]> = {};
    SITC_RULES.forEach(r => { grouped[r.code] = []; });
    data.forEach(rec => { grouped[getSITCCode(rec.komoditiUtama)].push(rec); });

    return SITC_RULES.map(rule => {
      const records = grouped[rule.code];
      const total = records.reduce((s, r) => s + r.jumlahDaganganRM, 0);

      // Find top state
      const stateMap: Record<string, number> = {};
      records.forEach(r => { stateMap[r.negeri] = (stateMap[r.negeri] || 0) + r.jumlahDaganganRM; });
      const topState = Object.entries(stateMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Selangor';

      // Find top region
      const regionMap: Record<string, number> = {};
      records.forEach(r => {
        const region = mapStateToRegion(r.negeri);
        regionMap[region] = (regionMap[region] || 0) + r.jumlahDaganganRM;
      });
      const topRegion = Object.entries(regionMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Semenanjung';

      return { code: rule.code, num: rule.num, label: rule.label, total, topState, topRegion };
    });
  }, [data]);

  const maxVal = useMemo(() => Math.max(...sitcItems.map(s => s.total), 1), [sitcItems]);

  const N = sitcItems.length;
  const angleStep = 360 / N;

  // Compute radar polygon points
  const dataPoints = sitcItems.map((item, i) => {
    const angle = i * angleStep;
    const r = (item.total / maxVal) * R_MAX;
    const [x, y] = polarToXY(angle, Math.max(r, R_MAX * 0.05));
    return { x, y, angle, item };
  });

  const polygonPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Grid scale labels
  const gridLabels = R_GRID.map(pct => ({
    value: formatRM(maxVal * pct),
    r: R_MAX * pct,
  }));

  const viewBox = `0 0 ${CX * 2} ${CY * 2}`;

  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[680px]">
        <svg viewBox={viewBox} className="w-full h-auto">
          {/* Concentric grid circles */}
          {R_GRID.map((pct, i) => (
            <circle
              key={i}
              cx={CX} cy={CY}
              r={R_MAX * pct}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={i === R_GRID.length - 1 ? 0.8 : 0.4}
              strokeDasharray={i < R_GRID.length - 1 ? '3 3' : 'none'}
              opacity={0.5}
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
                strokeWidth={0.4}
                opacity={0.4}
              />
            );
          })}

          {/* Scale labels on right axis */}
          {gridLabels.map((gl, i) => (
            <text
              key={i}
              x={CX + 4}
              y={CY - gl.r + 3}
              fontSize="8"
              fill="hsl(var(--muted-foreground))"
              opacity={0.6}
            >
              {gl.value}
            </text>
          ))}

          {/* Data polygon fill */}
          <motion.path
            d={polygonPath}
            fill="hsl(var(--primary) / 0.15)"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />

          {/* Data points */}
          {dataPoints.map((dp, i) => (
            <motion.circle
              key={i}
              cx={dp.x} cy={dp.y}
              r={hoveredIdx === i ? 6 : 4}
              fill={hoveredIdx === i ? 'hsl(var(--primary))' : 'hsl(var(--background))'}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              className="cursor-pointer transition-all"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {/* Axis labels */}
          {sitcItems.map((item, i) => {
            const angle = i * angleStep;
            const [lx, ly] = polarToXY(angle, LABEL_R);
            const isLeft = lx < CX - 20;
            const isRight = lx > CX + 20;
            return (
              <text
                key={i}
                x={lx}
                y={ly}
                fontSize="10"
                fontWeight={hoveredIdx === i ? 700 : 500}
                fill={hoveredIdx === i ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                textAnchor={isLeft ? 'end' : isRight ? 'start' : 'middle'}
                dominantBaseline="middle"
                className="transition-colors cursor-pointer select-none"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {item.code}
              </text>
            );
          })}
        </svg>

        {/* Icon overlays positioned around the radar */}
        {sitcItems.map((item, i) => {
          const angle = i * angleStep;
          // Convert SVG coords to percentage for absolute positioning
          const [ix, iy] = polarToXY(angle, ICON_R);
          const pctX = (ix / (CX * 2)) * 100;
          const pctY = (iy / (CY * 2)) * 100;
          const Icon = SITC_ICONS[item.num] || Package;
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${pctX}%`, top: `${pctY}%` }}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  hoveredIdx === i ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
            </div>
          );
        })}

        {/* Tooltip */}
        {hoveredIdx !== null && (() => {
          const dp = dataPoints[hoveredIdx];
          const pctX = (dp.x / (CX * 2)) * 100;
          const pctY = (dp.y / (CY * 2)) * 100;
          // Convert percentage to approximate pixel for tooltip positioning
          return (
            <RadarTooltipCard
              item={dp.item}
              x={(pctX / 100) * 680}
              y={(pctY / 100) * 680}
              maxVal={maxVal}
            />
          );
        })()}
      </div>
    </div>
  );
}
