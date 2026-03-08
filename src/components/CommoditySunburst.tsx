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

/* ─── Horizontal Tree Node ─── */
function TreeNode({ label, icon: Icon, color, depth, isExpanded, hasChildren, onClick }: {
  label: string; icon: React.ElementType; color: string; depth: number;
  isExpanded?: boolean; hasChildren?: boolean; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium whitespace-nowrap shrink-0 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-sm' : ''
      } ${isExpanded ? 'ring-1 ring-primary/30 shadow-sm' : ''}`}
      style={{
        borderColor: color + '40',
        background: isExpanded ? color + '15' : 'hsl(var(--card))',
        color: 'hsl(var(--foreground))',
      }}
    >
      <Icon className="w-3 h-3 shrink-0" style={{ color }} />
      <span className="truncate max-w-[120px]">{label}</span>
      {hasChildren && (
        <ChevronRight
          className={`w-3 h-3 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          style={{ color }}
        />
      )}
    </div>
  );
}

/* ─── Connector line (horizontal) ─── */
function HLine({ color }: { color: string }) {
  return <div className="w-4 h-px shrink-0" style={{ background: color + '50' }} />;
}

function VBranch({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-stretch">
      <div className="w-px shrink-0 my-1" style={{ background: color + '35' }} />
      <div className="flex flex-col gap-1 pl-0">
        {children}
      </div>
    </div>
  );
}

/* ─── Single SITC Panel with horizontal tree ─── */
function SITCPanel({ sitc }: { sitc: SITCData }) {
  const [expandedNegeri, setExpandedNegeri] = useState<string | null>(null);
  const [expandedKawasan, setExpandedKawasan] = useState<string | null>(null);
  const { t } = useLanguage();
  const colors = ACCENT_COLORS[sitc.colorIdx];
  const isEmpty = sitc.total === 0;

  const toggleNegeri = useCallback((name: string) => {
    setExpandedNegeri(prev => prev === name ? null : name);
    setExpandedKawasan(null);
  }, []);

  const activeNegeri = sitc.negeri.find(n => n.name === expandedNegeri);

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

      {/* Horizontal tree body */}
      {!isEmpty && (
        <div className="p-3 flex-1 overflow-x-auto overflow-y-auto max-h-[360px]">
          <div className="flex items-start gap-0 min-w-max">
            {/* Root node */}
            <div className="flex flex-col items-end justify-center shrink-0 mr-0">
              <div className="px-2 py-1 rounded-md text-[10px] font-bold text-white" style={{ background: colors.bar }}>
                {sitc.code}
              </div>
            </div>

            <HLine color={colors.bar} />

            {/* Negeri branches */}
            <VBranch color={colors.bar}>
              {sitc.negeri.slice(0, 10).map(neg => (
                <div key={neg.name} className="flex items-start gap-0">
                  <div className="flex items-center">
                    <HLine color={colors.bar} />
                    <TreeNode
                      label={neg.name}
                      icon={MapPin}
                      color={colors.bar}
                      depth={0}
                      hasChildren={neg.kawasan.length > 0}
                      isExpanded={expandedNegeri === neg.name}
                      onClick={() => toggleNegeri(neg.name)}
                    />
                  </div>

                  {/* Kawasan expansion */}
                  <AnimatePresence>
                    {expandedNegeri === neg.name && activeNegeri && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-start gap-0 overflow-hidden"
                      >
                        <HLine color={colors.bar} />
                        <VBranch color={colors.bar}>
                          {activeNegeri.kawasan.map(kw => (
                            <div key={kw.name} className="flex items-start gap-0">
                              <div className="flex items-center">
                                <HLine color={colors.bar} />
                                <TreeNode
                                  label={kw.name}
                                  icon={Globe2}
                                  color={colors.bar}
                                  depth={1}
                                  hasChildren={kw.saiz.length > 0}
                                  isExpanded={expandedKawasan === kw.name}
                                  onClick={() => setExpandedKawasan(prev => prev === kw.name ? null : kw.name)}
                                />
                              </div>

                              {/* Saiz expansion */}
                              <AnimatePresence>
                                {expandedKawasan === kw.name && (
                                  <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-start gap-0 overflow-hidden"
                                  >
                                    <HLine color={colors.bar} />
                                    <VBranch color={colors.bar}>
                                      {kw.saiz.map(s => (
                                        <div key={s.name} className="flex items-center">
                                          <HLine color={colors.bar} />
                                          <TreeNode
                                            label={s.name}
                                            icon={Building2}
                                            color={colors.bar}
                                            depth={2}
                                          />
                                        </div>
                                      ))}
                                    </VBranch>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </VBranch>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </VBranch>
          </div>
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
