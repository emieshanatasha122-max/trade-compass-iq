import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/mockTradeData';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const SITC_RULES: { code: string; label: string; keywords: string[] }[] = [
  { code: 'SITC 0', label: 'Makanan & Binatang Hidup', keywords: ['makanan', 'ikan', 'sayur', 'buah', 'gula', 'kopi', 'teh'] },
  { code: 'SITC 1', label: 'Minuman & Tembakau', keywords: ['tembakau', 'minuman'] },
  { code: 'SITC 2', label: 'Bahan Mentah', keywords: ['getah', 'bijih', 'kulit'] },
  { code: 'SITC 3', label: 'Bahan Api Mineral', keywords: ['petroleum', 'gas asli', 'arang batu', 'minyak mentah'] },
  { code: 'SITC 4', label: 'Minyak & Lemak', keywords: ['kelapa sawit', 'minyak sawit', 'oleokimia'] },
  { code: 'SITC 5', label: 'Bahan Kimia', keywords: ['kimia', 'farmaseutikal', 'baja', 'racun'] },
  { code: 'SITC 6', label: 'Barang Dikilang', keywords: ['logam', 'kayu', 'gergaji', 'perabut', 'rotan', 'kertas', 'simen', 'kaca'] },
  { code: 'SITC 7', label: 'Jentera & Pengangkutan', keywords: ['elektrik', 'elektronik', 'litar', 'jentera', 'mesin', 'alat ganti', 'motokar', 'kapal'] },
  { code: 'SITC 8', label: 'Pelbagai Barang Dikilang', keywords: ['pakaian', 'tekstil', 'kasut', 'kekemasan', 'mainan', 'sukan', 'optik'] },
  { code: 'SITC 9', label: 'Lain-lain', keywords: [] },
];

const COLORS = [
  'hsl(174, 60%, 70%)', // SITC 0
  'hsl(174, 55%, 60%)', // SITC 1
  'hsl(174, 50%, 50%)', // SITC 2
  'hsl(180, 55%, 45%)', // SITC 3
  'hsl(185, 55%, 40%)', // SITC 4
  'hsl(190, 60%, 38%)', // SITC 5
  'hsl(200, 60%, 35%)', // SITC 6
  'hsl(210, 65%, 35%)', // SITC 7
  'hsl(220, 60%, 35%)', // SITC 8
  'hsl(215, 40%, 30%)', // SITC 9
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

interface Props {
  data: TradeRecord[];
}

export default function CommoditySunburst({ data }: Props) {
  const [drillCode, setDrillCode] = useState<string | null>(null);

  const sitcData = useMemo(() => {
    const map: Record<string, { label: string; children: Record<string, number> }> = {};
    SITC_RULES.forEach(r => { map[r.code] = { label: r.label, children: {} }; });

    data.forEach(r => {
      const code = getSITCCode(r.komoditiUtama);
      map[code].children[r.komoditiUtama] = (map[code].children[r.komoditiUtama] || 0) + r.jumlahDaganganRM;
    });

    return SITC_RULES.map((rule, i) => {
      const entry = map[rule.code];
      const children = Object.entries(entry.children)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));
      const total = children.reduce((s, c) => s + c.value, 0);
      return { code: rule.code, label: entry.label, total, children, color: COLORS[i] };
    });
  }, [data]);

  const maxTotal = useMemo(() => Math.max(...sitcData.map(d => d.total), 1), [sitcData]);

  const drillData = useMemo(() => {
    if (!drillCode) return null;
    const item = sitcData.find(d => d.code === drillCode);
    if (!item || item.children.length === 0) return null;
    const maxChild = Math.max(...item.children.map(c => c.value), 1);
    return { ...item, maxChild };
  }, [drillCode, sitcData]);

  if (drillData) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setDrillCode(null)}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Kembali ke SITC 0–9
        </button>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: drillData.color }} />
          <span className="text-sm font-bold text-foreground">{drillData.code}: {drillData.label}</span>
          <span className="text-xs text-muted-foreground ml-auto">{formatRM(drillData.total)}</span>
        </div>
        <div className="space-y-2">
          {drillData.children.map(child => {
            const pct = drillData.maxChild > 0 ? (child.value / drillData.maxChild) * 100 : 0;
            return (
              <div key={child.name} className="group">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-foreground truncate max-w-[60%]">{child.name}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">{formatRM(child.value)}</span>
                </div>
                <div className="h-5 rounded bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{ width: `${Math.max(pct, 1)}%`, background: drillData.color, opacity: 0.85 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sitcData.map((item, i) => {
        const pct = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
        const isEmpty = item.total === 0;
        return (
          <div
            key={item.code}
            className={`group ${isEmpty ? 'opacity-50' : 'cursor-pointer'}`}
            onClick={() => !isEmpty && setDrillCode(item.code)}
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: item.color }} />
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">{item.code}</span>
                <span className="text-[10px] text-muted-foreground truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {isEmpty ? '–' : formatRM(item.total)}
                </span>
                {!isEmpty && <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
            </div>
            <div className="h-5 rounded bg-muted/40 overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500"
                style={{ width: `${Math.max(pct, isEmpty ? 0.5 : 1)}%`, background: item.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
