import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/mockTradeData';
import { useLanguage, ENTERPRISE_LABEL_MAP } from '@/contexts/LanguageContext';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const SITC_RULES: { code: string; label: string; keywords: string[] }[] = [
  { code: 'SITC 0', label: 'Makanan & Binatang Hidup', keywords: ['makanan', 'ikan', 'sayur', 'buah', 'gula', 'kopi', 'teh'] },
  { code: 'SITC 1', label: 'Minuman & Tembakau', keywords: ['tembakau', 'minuman'] },
  { code: 'SITC 2', label: 'Bahan Mentah Tak Boleh Dimakan (Kecuali Bahan Api)', keywords: ['getah', 'bijih', 'kulit'] },
  { code: 'SITC 3', label: 'Bahan Api Mineral, Pelincir & Bahan Berkaitan', keywords: ['petroleum', 'gas asli', 'arang batu', 'minyak mentah'] },
  { code: 'SITC 4', label: 'Minyak & Lemak Binatang/Tumbuhan', keywords: ['kelapa sawit', 'minyak sawit', 'oleokimia'] },
  { code: 'SITC 5', label: 'Bahan Kimia & Produk Berkaitan', keywords: ['kimia', 'farmaseutikal', 'baja', 'racun'] },
  { code: 'SITC 6', label: 'Barang-barang Dikilang (Berasas Kayu, Logam, Getah)', keywords: ['logam', 'kayu', 'gergaji', 'perabut', 'rotan', 'kertas', 'simen', 'kaca'] },
  { code: 'SITC 7', label: 'Jentera & Alat Pengangkutan (Termasuk E&E)', keywords: ['elektrik', 'elektronik', 'litar', 'jentera', 'mesin', 'alat ganti', 'motokar', 'kapal'] },
  { code: 'SITC 8', label: 'Pelbagai Barang Dikilang (Pakaian, Barangan Kemas, Kasut)', keywords: ['pakaian', 'tekstil', 'kasut', 'kekemasan', 'mainan', 'sukan', 'optik'] },
  { code: 'SITC 9', label: 'Komoditi & Urusniaga yang tidak dikelaskan di mana-mana', keywords: [] },
];

const COLORS = [
  'hsl(174, 60%, 70%)',
  'hsl(174, 55%, 60%)',
  'hsl(174, 50%, 50%)',
  'hsl(180, 55%, 45%)',
  'hsl(185, 55%, 40%)',
  'hsl(190, 60%, 38%)',
  'hsl(200, 60%, 35%)',
  'hsl(210, 65%, 35%)',
  'hsl(220, 60%, 35%)',
  'hsl(215, 40%, 30%)',
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

type DrillLevel = 'negeri' | 'kawasan' | 'saiz';
const DRILL_LABELS: Record<DrillLevel, string> = {
  negeri: 'Negeri',
  kawasan: 'Kawasan',
  saiz: 'Saiz Syarikat',
};
const DRILL_ORDER: DrillLevel[] = ['negeri', 'kawasan', 'saiz'];

interface Props {
  data: TradeRecord[];
}

export default function CommoditySunburst({ data }: Props) {
  const [drillCode, setDrillCode] = useState<string | null>(null);
  const [drillLevel, setDrillLevel] = useState<DrillLevel>('negeri');
  const { t } = useLanguage();

  const sitcData = useMemo(() => {
    const map: Record<string, TradeRecord[]> = {};
    SITC_RULES.forEach(r => { map[r.code] = []; });
    data.forEach(r => {
      const code = getSITCCode(r.komoditiUtama);
      map[code].push(r);
    });

    return SITC_RULES.map((rule, i) => {
      const records = map[rule.code];
      const total = records.reduce((s, r) => s + r.jumlahDaganganRM, 0);
      return { code: rule.code, label: rule.label, total, records, color: COLORS[i] };
    });
  }, [data]);

  const drillData = useMemo(() => {
    if (!drillCode) return null;
    const item = sitcData.find(d => d.code === drillCode);
    if (!item) return null;

    const grouped: Record<string, number> = {};
    item.records.forEach(r => {
      let key: string;
      if (drillLevel === 'negeri') key = r.negeri;
      else if (drillLevel === 'kawasan') key = r.kawasan;
      else key = t(ENTERPRISE_LABEL_MAP[r.keluasanSyarikat] || r.keluasanSyarikat);
      grouped[key] = (grouped[key] || 0) + r.jumlahDaganganRM;
    });

    const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    const max = Math.max(...entries.map(e => e[1]), 1);
    return { ...item, entries, max };
  }, [drillCode, drillLevel, sitcData, t]);

  if (drillData) {
    const colorIdx = SITC_RULES.findIndex(r => r.code === drillCode);
    const color = COLORS[colorIdx >= 0 ? colorIdx : 9];

    return (
      <div className="space-y-3">
        <button
          onClick={() => { setDrillCode(null); setDrillLevel('negeri'); }}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Kembali ke SITC 0–9
        </button>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />
          <span className="text-sm font-bold text-foreground">{drillData.code}: {drillData.label}</span>
          <span className="text-xs text-muted-foreground ml-auto">{formatRM(drillData.total)}</span>
        </div>

        {/* Drill level tabs */}
        <div className="flex gap-1 border-b border-border pb-1">
          {DRILL_ORDER.map(level => (
            <button
              key={level}
              onClick={() => setDrillLevel(level)}
              className={`px-3 py-1 text-[11px] font-medium rounded-t transition-colors ${
                drillLevel === level
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {DRILL_LABELS[level]}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {drillData.entries.map(([name, value]) => {
            const pct = (value / drillData.max) * 100;
            return (
              <div key={name}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-foreground truncate max-w-[60%]">{name}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">{formatRM(value)}</span>
                </div>
                <div className="h-5 rounded bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{ width: `${Math.max(pct, 1)}%`, background: color, opacity: 0.85 }}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {sitcData.map(item => {
        const isEmpty = item.total === 0;
        return (
          <div
            key={item.code}
            onClick={() => !isEmpty && setDrillCode(item.code)}
            className={`rounded-lg border bg-card p-4 transition-shadow ${
              isEmpty ? 'opacity-50' : 'cursor-pointer hover:shadow-md hover:border-primary/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: item.color }} />
              <span className="text-xs font-bold text-foreground">{item.code}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug mb-3 line-clamp-2 min-h-[2.5em]">
              {item.label}
            </p>
            <p className="text-base font-bold text-foreground">{isEmpty ? '–' : formatRM(item.total)}</p>
            {!isEmpty && (
              <div className="flex items-center gap-1 mt-2 text-[10px] text-primary font-medium">
                Lihat pecahan <ChevronRight className="w-3 h-3" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
