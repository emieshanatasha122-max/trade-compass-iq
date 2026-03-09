import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/mockTradeData';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, Wine, Leaf, Fuel, Droplets, FlaskConical,
  Hammer, Cpu, ShirtIcon, Package, ChevronDown
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

const STATE_LIST = [
  'Selangor', 'Johor', 'Pulau Pinang', 'Sarawak', 'Sabah', 'Perak', 'Kedah',
  'Pahang', 'Kelantan', 'Terengganu', 'Melaka', 'Negeri Sembilan', 'Perlis',
  'W.P. Kuala Lumpur', 'W.P. Labuan', 'Supra', 'Agent',
];

const REGION_LIST = ['Semenanjung', 'Sabah', 'Sarawak', 'Zon Bebas'];

const STATE_TO_REGION: Record<string, string> = {
  'Sabah': 'Sabah',
  'Sarawak': 'Sarawak',
  'W.P. Labuan': 'Zon Bebas',
  'Supra': 'Zon Bebas',
  'Agent': 'Zon Bebas',
};

function mapStateToRegion(state: string): string {
  return STATE_TO_REGION[state] || 'Semenanjung';
}

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

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function curvePath(x1: number, y1: number, x2: number, y2: number) {
  const c = (x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`;
}

const DEFAULT_VISIBLE = 4;

interface StateNode { name: string; region: string; widthPct: number }
interface RegionNode { name: string; widthPct: number }
interface SITCData {
  code: string; num: number; label: string; total: number;
  states: StateNode[]; regions: RegionNode[];
}

function SITCTreeCard({ sitc }: { sitc: SITCData }) {
  const [expanded, setExpanded] = useState(false);
  const visibleStates = expanded ? sitc.states : sitc.states.slice(0, DEFAULT_VISIBLE);
  const hasMore = sitc.states.length > DEFAULT_VISIBLE;
  const Icon = SITC_ICONS[sitc.num] || Package;

  const c = {
    width: 580,
    rootX: 8,
    stateX: 190,
    regionX: 400,
    rootW: 150,
    nodeW: 130,
    top: 12,
    row: 26,
    offsetY: 13,
  };

  const stateCount = visibleStates.length;
  const regionCount = sitc.regions.length;
  const height = c.top * 2 + c.row * Math.max(stateCount, regionCount) + c.offsetY;

  const stateY = (i: number) => c.top + i * c.row + c.offsetY;
  const regionY = (i: number) => {
    const inner = height - c.top * 2;
    return c.top + ((i + 1) * inner) / (regionCount + 1);
  };
  const rootY = height / 2;

  const regionCenterMap = sitc.regions.reduce<Record<string, number>>((acc, r, i) => {
    acc[r.name] = regionY(i);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: sitc.num * 0.02 }}
      className="rounded-lg border border-border bg-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/30">
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-foreground leading-tight truncate">
            {sitc.code}: {sitc.label}
          </p>
          <p className="text-xs font-bold text-primary">{formatRM(sitc.total)}</p>
        </div>
      </div>

      {/* Tree canvas */}
      <div className="relative overflow-x-auto">
        <div className="relative" style={{ width: c.width, height }}>
          <svg
            width={c.width}
            height={height}
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            {/* Root → States */}
            {visibleStates.map((state, i) => (
              <motion.path
                key={`rs-${state.name}`}
                d={curvePath(c.rootX + c.rootW, rootY, c.stateX - 6, stateY(i))}
                fill="none"
                stroke="hsl(var(--primary) / 0.28)"
                strokeWidth="1.2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.01 * i }}
              />
            ))}
            {/* States → Regions */}
            {visibleStates.map((state, i) => {
              const y2 = regionCenterMap[state.region] ?? rootY;
              return (
                <motion.path
                  key={`sr-${state.name}`}
                  d={curvePath(c.stateX + c.nodeW, stateY(i), c.regionX - 6, y2)}
                  fill="none"
                  stroke="hsl(var(--primary) / 0.18)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.08 + 0.008 * i }}
                />
              );
            })}
          </svg>

          {/* Root node */}
          <div
            className="absolute rounded-md border border-border bg-secondary/40 px-2 py-1.5"
            style={{ left: c.rootX, top: rootY - 20, width: c.rootW }}
          >
            <p className="text-[9px] font-semibold text-foreground leading-tight truncate">Negeri</p>
            <p className="text-[9px] text-muted-foreground">→ Kawasan</p>
          </div>

          {/* State bars */}
          {visibleStates.map((state, i) => (
            <div
              key={`s-${state.name}`}
              className="absolute"
              style={{ left: c.stateX, top: stateY(i) - 11, width: c.nodeW }}
            >
              <p className="text-[8px] font-medium text-foreground truncate mb-0.5">{state.name}</p>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${clamp(state.widthPct, 12, 100)}%` }}
                />
              </div>
            </div>
          ))}

          {/* Region bars */}
          {sitc.regions.map((region, i) => (
            <div
              key={`r-${region.name}`}
              className="absolute"
              style={{ left: c.regionX, top: regionY(i) - 11, width: c.nodeW }}
            >
              <p className="text-[8px] font-medium text-foreground truncate mb-0.5">{region.name}</p>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${clamp(region.widthPct, 15, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View More */}
      {hasMore && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium text-primary hover:bg-secondary/40 transition-colors border-t border-border"
        >
          {expanded ? 'Tutup' : `Lagi ${sitc.states.length - DEFAULT_VISIBLE} negeri`}
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </motion.div>
  );
}

interface Props { data: TradeRecord[] }

export default function CommoditySunburst({ data }: Props) {
  const sitcPanels = useMemo<SITCData[]>(() => {
    const grouped: Record<string, TradeRecord[]> = {};
    SITC_RULES.forEach(rule => { grouped[rule.code] = []; });
    data.forEach(record => { grouped[getSITCCode(record.komoditiUtama)].push(record); });

    const stateBase = [96, 92, 88, 84, 81, 78, 75, 72, 69, 66, 63, 60, 57, 54, 51, 48, 45];
    const regionBase = [94, 86, 78, 70];

    return SITC_RULES.map(rule => {
      const total = grouped[rule.code].reduce((sum, row) => sum + row.jumlahDaganganRM, 0);
      const states: StateNode[] = STATE_LIST.map((name, i) => ({
        name, region: mapStateToRegion(name),
        widthPct: clamp(stateBase[i] - (rule.num % 3) * 3, 30, 100),
      }));
      const regions: RegionNode[] = REGION_LIST.map((name, i) => ({
        name, widthPct: clamp(regionBase[i] - (rule.num % 4) * 2, 36, 100),
      }));
      return { code: rule.code, num: rule.num, label: rule.label, total, states, regions };
    }).sort((a, b) => a.num - b.num);
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sitcPanels.map(sitc => (
        <SITCTreeCard key={sitc.code} sitc={sitc} />
      ))}
    </div>
  );
}
