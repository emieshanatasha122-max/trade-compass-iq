import React, { useMemo, useState, useCallback } from 'react';
import type { TradeRecord } from '@/data/mockTradeData';
import { useLanguage, ENTERPRISE_LABEL_MAP } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, Globe2, Building2 } from 'lucide-react';

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

const ACCENT_COLORS = [
  { bg: 'hsl(174 60% 94%)', bar: 'hsl(174 60% 50%)', text: 'hsl(174 60% 30%)' },
  { bg: 'hsl(174 50% 92%)', bar: 'hsl(174 55% 45%)', text: 'hsl(174 55% 28%)' },
  { bg: 'hsl(180 50% 92%)', bar: 'hsl(180 55% 42%)', text: 'hsl(180 55% 25%)' },
  { bg: 'hsl(185 50% 91%)', bar: 'hsl(185 55% 40%)', text: 'hsl(185 55% 24%)' },
  { bg: 'hsl(190 50% 91%)', bar: 'hsl(190 55% 38%)', text: 'hsl(190 55% 22%)' },
  { bg: 'hsl(195 55% 91%)', bar: 'hsl(195 60% 36%)', text: 'hsl(195 60% 22%)' },
  { bg: 'hsl(200 55% 91%)', bar: 'hsl(200 60% 35%)', text: 'hsl(200 60% 20%)' },
  { bg: 'hsl(210 60% 92%)', bar: 'hsl(210 65% 35%)', text: 'hsl(210 65% 20%)' },
  { bg: 'hsl(220 55% 92%)', bar: 'hsl(220 60% 38%)', text: 'hsl(220 60% 22%)' },
  { bg: 'hsl(215 40% 90%)', bar: 'hsl(215 40% 32%)', text: 'hsl(215 40% 18%)' },
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

interface SaizNode { name: string; value: number }
interface KawasanNode { name: string; value: number; saiz: SaizNode[] }
interface NegeriNode { name: string; value: number; kawasan: KawasanNode[] }
interface SITCData {
  code: string; num: number; label: string; total: number;
  negeri: NegeriNode[]; colorIdx: number;
}

/* ─── Horizontal bar with label ─── */
function HBar({ label, pct, color, icon: Icon, onClick, isExpanded, hasChildren }: {
  label: string; pct: number; color: string; icon: React.ElementType;
  onClick?: () => void; isExpanded?: boolean; hasChildren?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1.5 group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <Icon className="w-3 h-3 shrink-0 text-muted-foreground" />
      <span className="text-[10px] text-foreground font-medium w-[90px] truncate shrink-0">{label}</span>
      <div className="h-4 flex-1 rounded-sm bg-muted/30 overflow-hidden min-w-[40px]">
        <motion.div
          className="h-full rounded-sm"
          style={{ background: color, opacity: 0.75 }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(pct, 2)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      {hasChildren && (
        <ChevronRight
          className={`w-3 h-3 shrink-0 transition-transform text-muted-foreground ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-0.5'}`}
        />
      )}
    </div>
  );
}

/* ─── Branch connector (vertical line + horizontal stubs) ─── */
function BranchGroup({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-5 ml-[6px] border-l" style={{ borderColor: color + '30' }}>
      {React.Children.map(children, (child) => (
        <div className="relative py-[2px]">
          {/* horizontal connector stub */}
          <div className="absolute left-0 top-1/2 w-4 h-px -translate-x-px" style={{ background: color + '40' }} />
          <div className="pl-1">{child}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Single SITC Panel ─── */
function SITCPanel({ sitc }: { sitc: SITCData }) {
  const [expandedNegeri, setExpandedNegeri] = useState<string | null>(null);
  const [expandedKawasan, setExpandedKawasan] = useState<string | null>(null);

  const colors = ACCENT_COLORS[sitc.colorIdx];
  const isEmpty = sitc.total === 0;
  const negeriMax = useMemo(() => Math.max(...sitc.negeri.map(n => n.value), 1), [sitc.negeri]);

  const toggleNegeri = useCallback((name: string) => {
    setExpandedNegeri(prev => prev === name ? null : name);
    setExpandedKawasan(null);
  }, []);

  const activeNegeri = sitc.negeri.find(n => n.name === expandedNegeri);
  const kawasanMax = activeNegeri ? Math.max(...activeNegeri.kawasan.map(k => k.value), 1) : 1;

  const activeKawasan = activeNegeri?.kawasan.find(k => k.name === expandedKawasan);
  const saizMax = activeKawasan ? Math.max(...activeKawasan.saiz.map(s => s.value), 1) : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: sitc.colorIdx * 0.03 }}
      className={`rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col ${isEmpty ? 'opacity-40' : ''}`}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ background: colors.bg }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: colors.bar }}>
            {sitc.code}
          </span>
        </div>
        <h3 className="text-xs font-semibold leading-snug" style={{ color: colors.text }}>{sitc.label}</h3>
        <p className="text-lg font-bold mt-1" style={{ color: colors.text }}>
          {isEmpty ? '–' : formatRM(sitc.total)}
        </p>
      </div>

      {/* Tree body */}
      {!isEmpty && (
        <div className="px-3 py-3 flex-1 overflow-y-auto max-h-[400px] space-y-0">
          {/* Negeri level */}
          {sitc.negeri.slice(0, 12).map(neg => {
            const negPct = (neg.value / negeriMax) * 100;
            const isNegExpanded = expandedNegeri === neg.name;
            return (
              <div key={neg.name}>
                <HBar
                  label={neg.name}
                  pct={negPct}
                  color={colors.bar}
                  icon={MapPin}
                  hasChildren={neg.kawasan.length > 0}
                  isExpanded={isNegExpanded}
                  onClick={() => toggleNegeri(neg.name)}
                />

                {/* Kawasan level */}
                <AnimatePresence>
                  {isNegExpanded && activeNegeri && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <BranchGroup color={colors.bar}>
                        {activeNegeri.kawasan.map(kw => {
                          const kwPct = (kw.value / kawasanMax) * 100;
                          const isKwExpanded = expandedKawasan === kw.name;
                          return (
                            <div key={kw.name}>
                              <HBar
                                label={kw.name}
                                pct={kwPct}
                                color={colors.bar}
                                icon={Globe2}
                                hasChildren={kw.saiz.length > 0}
                                isExpanded={isKwExpanded}
                                onClick={() => setExpandedKawasan(prev => prev === kw.name ? null : kw.name)}
                              />

                              {/* Saiz level */}
                              <AnimatePresence>
                                {isKwExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <BranchGroup color={colors.bar}>
                                      {kw.saiz.map(s => (
                                        <HBar
                                          key={s.name}
                                          label={s.name}
                                          pct={(s.value / saizMax) * 100}
                                          color={colors.bar}
                                          icon={Building2}
                                        />
                                      ))}
                                    </BranchGroup>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </BranchGroup>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

interface Props { data: TradeRecord[] }

export default function CommoditySunburst({ data }: Props) {
  const { t } = useLanguage();

  const sitcPanels = useMemo<SITCData[]>(() => {
    const map: Record<string, TradeRecord[]> = {};
    SITC_RULES.forEach(r => { map[r.code] = []; });
    data.forEach(r => { map[getSITCCode(r.komoditiUtama)].push(r); });

    return SITC_RULES.map((rule, i) => {
      const records = map[rule.code];
      const total = records.reduce((s, r) => s + r.jumlahDaganganRM, 0);

      const negeriMap: Record<string, Record<string, Record<string, number>>> = {};
      records.forEach(r => {
        if (!negeriMap[r.negeri]) negeriMap[r.negeri] = {};
        if (!negeriMap[r.negeri][r.kawasan]) negeriMap[r.negeri][r.kawasan] = {};
        const saizLabel = t(ENTERPRISE_LABEL_MAP[r.keluasanSyarikat] || r.keluasanSyarikat);
        negeriMap[r.negeri][r.kawasan][saizLabel] = (negeriMap[r.negeri][r.kawasan][saizLabel] || 0) + r.jumlahDaganganRM;
      });

      const negeri = Object.entries(negeriMap)
        .map(([nName, kawasanObj]) => {
          const kawasan = Object.entries(kawasanObj)
            .map(([kName, saizObj]) => {
              const saiz = Object.entries(saizObj)
                .sort((a, b) => b[1] - a[1])
                .map(([sName, sVal]) => ({ name: sName, value: sVal }));
              return { name: kName, value: saiz.reduce((s, x) => s + x.value, 0), saiz };
            })
            .sort((a, b) => b.value - a.value);
          return { name: nName, value: kawasan.reduce((s, k) => s + k.value, 0), kawasan };
        })
        .sort((a, b) => b.value - a.value);

      return { code: rule.code, num: rule.num, label: rule.label, total, negeri, colorIdx: i };
    });
  }, [data, t]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {sitcPanels.map(sitc => (
        <SITCPanel key={sitc.code} sitc={sitc} />
      ))}
    </div>
  );
}
