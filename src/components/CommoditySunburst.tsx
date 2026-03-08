import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/mockTradeData';
import { useLanguage, ENTERPRISE_LABEL_MAP } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

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

interface Props {
  data: TradeRecord[];
}

interface NegeriEntry {
  name: string;
  value: number;
  kawasan: { name: string; value: number }[];
}

export default function CommoditySunburst({ data }: Props) {
  const [expandedSITC, setExpandedSITC] = useState<string | null>(null);
  const [expandedNegeri, setExpandedNegeri] = useState<Record<string, string | null>>({});

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

      // Group by negeri
      const negeriMap: Record<string, { value: number; kawasanMap: Record<string, number> }> = {};
      records.forEach(r => {
        if (!negeriMap[r.negeri]) negeriMap[r.negeri] = { value: 0, kawasanMap: {} };
        negeriMap[r.negeri].value += r.jumlahDaganganRM;
        negeriMap[r.negeri].kawasanMap[r.kawasan] = (negeriMap[r.negeri].kawasanMap[r.kawasan] || 0) + r.jumlahDaganganRM;
      });

      const negeri: NegeriEntry[] = Object.entries(negeriMap)
        .sort((a, b) => b[1].value - a[1].value)
        .map(([name, d]) => ({
          name,
          value: d.value,
          kawasan: Object.entries(d.kawasanMap).sort((a, b) => b[1] - a[1]).map(([kn, kv]) => ({ name: kn, value: kv })),
        }));

      return { code: rule.code, label: rule.label, total, negeri, color: COLORS[i] };
    });
  }, [data]);

  const globalMax = useMemo(() => Math.max(...sitcData.map(d => d.total), 1), [sitcData]);

  return (
    <div className="space-y-1">
      {sitcData.map((item, idx) => {
        const isEmpty = item.total === 0;
        const isExpanded = expandedSITC === item.code;
        const negeriMax = Math.max(...item.negeri.map(n => n.value), 1);

        return (
          <div key={item.code} className="group">
            {/* SITC Root Row */}
            <div
              onClick={() => !isEmpty && setExpandedSITC(isExpanded ? null : item.code)}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors ${
                isEmpty ? 'opacity-40' : 'cursor-pointer hover:bg-muted/50'
              } ${isExpanded ? 'bg-muted/60' : ''}`}
            >
              {/* Color dot + connector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-3 h-3 rounded-full border-2 shrink-0" style={{ borderColor: item.color, background: isExpanded ? item.color : 'transparent' }} />
              </div>

              {/* Label */}
              <div className="min-w-[200px] max-w-[260px] shrink-0">
                <span className="text-xs font-bold text-foreground">{item.code}</span>
                <span className="text-[10px] text-muted-foreground ml-1.5">{item.label}</span>
              </div>

              {/* Bar + Value */}
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-6 rounded bg-muted/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded"
                    style={{ background: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max((item.total / globalMax) * 100, isEmpty ? 0.3 : 0.8)}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.04 }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground w-[80px] text-right shrink-0">
                  {isEmpty ? '–' : formatRM(item.total)}
                </span>
              </div>
            </div>

            {/* Expanded Negeri branches */}
            <AnimatePresence>
              {isExpanded && !isEmpty && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 border-l-2 border-border/60 pl-0">
                    {item.negeri.map((neg, nIdx) => {
                      const negKey = `${item.code}::${neg.name}`;
                      const isNegExpanded = expandedNegeri[item.code] === neg.name;
                      const kawasanMax = Math.max(...neg.kawasan.map(k => k.value), 1);

                      return (
                        <div key={neg.name}>
                          {/* Negeri row */}
                          <div
                            onClick={() => setExpandedNegeri(prev => ({
                              ...prev,
                              [item.code]: isNegExpanded ? null : neg.name,
                            }))}
                            className="flex items-center gap-2 py-1.5 pl-3 pr-3 cursor-pointer hover:bg-muted/30 rounded-r transition-colors"
                          >
                            {/* Branch connector */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="w-4 h-px" style={{ background: item.color, opacity: 0.5 }} />
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: isNegExpanded ? item.color : 'transparent', border: `1.5px solid ${item.color}` }}
                              />
                            </div>

                            {/* Negeri label */}
                            <span className="text-[11px] font-medium text-foreground w-[120px] shrink-0 truncate">{neg.name}</span>

                            {/* Bar */}
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 h-4 rounded bg-muted/25 overflow-hidden">
                                <motion.div
                                  className="h-full rounded"
                                  style={{ background: item.color, opacity: 0.7 }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.max((neg.value / negeriMax) * 100, 1)}%` }}
                                  transition={{ duration: 0.4, delay: nIdx * 0.03 }}
                                />
                              </div>
                              <span className="text-[10px] font-medium text-muted-foreground w-[70px] text-right shrink-0">
                                {formatRM(neg.value)}
                              </span>
                            </div>
                          </div>

                          {/* Kawasan drill-down */}
                          <AnimatePresence>
                            {isNegExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-[30px] border-l border-border/40 pl-0">
                                  {neg.kawasan.map((kw, kIdx) => (
                                    <div key={kw.name} className="flex items-center gap-2 py-1 pl-3 pr-3">
                                      <span className="w-3 h-px" style={{ background: item.color, opacity: 0.35 }} />
                                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color, opacity: 0.6 }} />
                                      <span className="text-[10px] text-muted-foreground w-[90px] shrink-0 truncate">{kw.name}</span>
                                      <div className="flex-1 flex items-center gap-2">
                                        <div className="flex-1 h-3 rounded bg-muted/20 overflow-hidden">
                                          <motion.div
                                            className="h-full rounded"
                                            style={{ background: item.color, opacity: 0.5 }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max((kw.value / kawasanMax) * 100, 1)}%` }}
                                            transition={{ duration: 0.3, delay: kIdx * 0.04 }}
                                          />
                                        </div>
                                        <span className="text-[9px] text-muted-foreground w-[60px] text-right shrink-0">
                                          {formatRM(kw.value)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
