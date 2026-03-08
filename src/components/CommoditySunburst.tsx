import React, { useMemo } from 'react';
import type { TradeRecord } from '@/data/mockTradeData';
import { motion } from 'framer-motion';

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
  const c = (x2 - x1) * 0.55;
  return `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`;
}

interface StateNode {
  name: string;
  region: string;
  widthPct: number;
}

interface RegionNode {
  name: string;
  widthPct: number;
}

interface SITCData {
  code: string;
  num: number;
  label: string;
  total: number;
  states: StateNode[];
  regions: RegionNode[];
}

function ProgressNode({ label, widthPct }: { label: string; widthPct: number }) {
  return (
    <div className="w-[200px]">
      <p className="text-[10px] font-semibold text-foreground mb-1 truncate">{label}</p>
      <div className="h-3.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${clamp(widthPct, 12, 100)}%` }}
        />
      </div>
    </div>
  );
}

function SITCTreeCard({ sitc }: { sitc: SITCData }) {
  const canvas = {
    width: 940,
    rootX: 24,
    stateX: 320,
    regionX: 620,
    rootWidth: 240,
    stateWidth: 200,
    top: 20,
    row: 34,
    nodeOffsetY: 18,
  };

  const height = canvas.top * 2 + canvas.row * (sitc.states.length - 1) + canvas.nodeOffsetY * 2;

  const stateY = (index: number) => canvas.top + index * canvas.row + canvas.nodeOffsetY;
  const regionY = (index: number) => {
    const innerHeight = height - canvas.top * 2;
    return canvas.top + ((index + 1) * innerHeight) / (sitc.regions.length + 1) + 2;
  };

  const rootY = height / 2;

  const regionCenterMap = sitc.regions.reduce<Record<string, number>>((acc, r, i) => {
    acc[r.name] = regionY(i);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: sitc.num * 0.03 }}
      className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
    >
      <div className="relative overflow-x-auto">
        <div className="relative" style={{ width: canvas.width, height }}>
          {/* Curved links */}
          <svg
            width={canvas.width}
            height={height}
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            {sitc.states.map((state, i) => {
              const y = stateY(i);
              return (
                <motion.path
                  key={`root-state-${state.name}`}
                  d={curvePath(canvas.rootX + canvas.rootWidth, rootY, canvas.stateX - 10, y)}
                  fill="none"
                  stroke="hsl(var(--primary) / 0.30)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.45, delay: 0.01 * i }}
                />
              );
            })}

            {sitc.states.map((state, i) => {
              const y1 = stateY(i);
              const y2 = regionCenterMap[state.region] ?? rootY;
              return (
                <motion.path
                  key={`state-region-${state.name}`}
                  d={curvePath(canvas.stateX + canvas.stateWidth, y1, canvas.regionX - 10, y2)}
                  fill="none"
                  stroke="hsl(var(--primary) / 0.22)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.45, delay: 0.12 + 0.008 * i }}
                />
              );
            })}
          </svg>

          {/* Root */}
          <div
            className="absolute rounded-lg border border-border bg-secondary/40 p-3"
            style={{ left: canvas.rootX, top: rootY - 42, width: canvas.rootWidth }}
          >
            <p className="text-xs font-semibold text-foreground leading-tight">{sitc.code}: {sitc.label}</p>
            <p className="text-base font-bold text-primary mt-1">{formatRM(sitc.total)}</p>
          </div>

          {/* States */}
          {sitc.states.map((state, i) => (
            <div
              key={`state-${state.name}`}
              className="absolute"
              style={{ left: canvas.stateX, top: stateY(i) - 16, width: canvas.stateWidth }}
            >
              <ProgressNode label={state.name} widthPct={state.widthPct} />
            </div>
          ))}

          {/* Regions */}
          {sitc.regions.map((region, i) => (
            <div
              key={`region-${region.name}`}
              className="absolute"
              style={{ left: canvas.regionX, top: regionY(i) - 16, width: 200 }}
            >
              <ProgressNode label={region.name} widthPct={region.widthPct} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface Props { data: TradeRecord[] }

export default function CommoditySunburst({ data }: Props) {
  const sitcPanels = useMemo<SITCData[]>(() => {
    const grouped: Record<string, TradeRecord[]> = {};
    SITC_RULES.forEach(rule => {
      grouped[rule.code] = [];
    });

    data.forEach(record => {
      grouped[getSITCCode(record.komoditiUtama)].push(record);
    });

    const stateBase = [96, 92, 88, 84, 81, 78, 75, 72, 69, 66, 63, 60, 57, 54, 51, 48, 45];
    const regionBase = [94, 86, 78, 70];

    return SITC_RULES
      .map(rule => {
        const total = grouped[rule.code].reduce((sum, row) => sum + row.jumlahDaganganRM, 0);

        const states: StateNode[] = STATE_LIST.map((name, i) => ({
          name,
          region: mapStateToRegion(name),
          widthPct: clamp(stateBase[i] - (rule.num % 3) * 3, 30, 100),
        }));

        const regions: RegionNode[] = REGION_LIST.map((name, i) => ({
          name,
          widthPct: clamp(regionBase[i] - (rule.num % 4) * 2, 36, 100),
        }));

        return {
          code: rule.code,
          num: rule.num,
          label: rule.label,
          total,
          states,
          regions,
        };
      })
      .sort((a, b) => a.num - b.num);
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      {sitcPanels.map(sitc => (
        <SITCTreeCard key={sitc.code} sitc={sitc} />
      ))}
    </div>
  );
}
