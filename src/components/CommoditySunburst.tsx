import React, { useMemo, useState, useCallback } from 'react';
import type { TradeRecord } from '@/data/mockTradeData';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/* ─── Constants ─── */
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

const ALL_STATES = [
  'Selangor', 'Johor', 'Pulau Pinang', 'Sarawak', 'Sabah', 'Perak', 'Kedah',
  'Pahang', 'Kelantan', 'Terengganu', 'Melaka', 'Negeri Sembilan', 'Perlis',
  'W.P. Kuala Lumpur', 'W.P. Labuan', 'Supra', 'Agent',
];

const KAWASAN_LIST = ['Semenanjung', 'Sabah', 'Sarawak', 'Zon Bebas'];
const SAIZ_LIST = ['PKS - Mikro', 'PKS - Kecil', 'PKS - Sederhana', 'Syarikat Besar'];

const SAIZ_KEY_MAP: Record<string, string> = {
  'SME_MICRO': 'PKS - Mikro',
  'SME_SMALL': 'PKS - Kecil',
  'SME_MEDIUM': 'PKS - Sederhana',
  'LARGE': 'Syarikat Besar',
  'AGENTS': 'Ejen Perdagangan',
};

const KAWASAN_MAP: Record<string, string> = {
  'Asia': 'Semenanjung',
  'Eropah': 'Semenanjung',
  'Amerika': 'Semenanjung',
  'Oceania': 'Semenanjung',
  'Afrika': 'Semenanjung',
};

function mapKawasan(negeri: string, kawasan: string): string {
  if (negeri === 'Sabah') return 'Sabah';
  if (negeri === 'Sarawak') return 'Sarawak';
  if (negeri === 'W.P. Labuan') return 'Zon Bebas';
  return KAWASAN_MAP[kawasan] || 'Semenanjung';
}

const DEFAULT_TOP = 4;

const ACCENT = {
  bar: 'hsl(var(--primary))',
  barBg: 'hsl(var(--muted))',
  line: 'hsl(var(--primary) / 0.35)',
  headerBg: 'hsl(var(--primary) / 0.08)',
  headerText: 'hsl(var(--primary))',
  badge: 'hsl(var(--primary))',
};

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

/* ─── Data types ─── */
interface SaizNode { name: string; value: number }
interface KawasanNode { name: string; value: number; saiz: SaizNode[] }
interface NegeriNode { name: string; value: number; kawasan: KawasanNode[] }
interface SITCData {
  code: string; num: number; label: string; total: number;
  negeri: NegeriNode[];
}

/* ─── Labeled Bar ─── */
function LabeledBar({ label, value, pct, depth }: {
  label: string; value: number; pct: number; depth: number;
}) {
  const heights = [10, 8, 7];
  const h = heights[depth] || 7;
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 mb-0.5">
        <span className="text-[10px] font-semibold text-foreground truncate">{label}</span>
        <span className="text-[9px] font-bold text-primary whitespace-nowrap">{formatRM(value)}</span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: h, background: ACCENT.barBg }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: ACCENT.bar }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(pct, 3)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/* ─── Connector Lines ─── */
function TreeBranch({ children, isLast }: { children: React.ReactNode; isLast?: boolean }) {
  return (
    <div className="relative flex items-stretch">
      {/* Vertical + horizontal connector */}
      <div className="relative w-5 shrink-0">
        {/* Vertical line */}
        <div
          className="absolute left-0 top-0 w-px"
          style={{
            background: ACCENT.line,
            height: isLast ? '50%' : '100%',
          }}
        />
        {/* Horizontal stub */}
        <div
          className="absolute left-0 top-1/2 h-px -translate-y-px"
          style={{ background: ACCENT.line, width: '100%' }}
        />
      </div>
      <div className="flex-1 py-[3px] min-w-0">{children}</div>
    </div>
  );
}

function BranchContainer({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <div className="ml-2 relative">
      {items.map((child, i) => (
        <TreeBranch key={i} isLast={i === items.length - 1}>
          {child}
        </TreeBranch>
      ))}
    </div>
  );
}

/* ─── Expandable Row ─── */
function ExpandableRow({ label, value, pct, depth, hasChildren, children }: {
  label: string; value: number; pct: number; depth: number;
  hasChildren?: boolean; children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div
        className={`group ${hasChildren ? 'cursor-pointer' : ''}`}
        onClick={() => hasChildren && setExpanded(p => !p)}
      >
        <div className="flex items-center gap-1">
          {hasChildren && (
            <ChevronRight
              className={`w-3 h-3 shrink-0 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-90' : 'group-hover:translate-x-0.5'}`}
            />
          )}
          {!hasChildren && <div className="w-3 shrink-0" />}
          <div className="flex-1 min-w-0">
            <LabeledBar label={label} value={value} pct={pct} depth={depth} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <BranchContainer>{children}</BranchContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Single SITC Panel ─── */
function SITCPanel({ sitc }: { sitc: SITCData }) {
  const [showAll, setShowAll] = useState(false);
  const isEmpty = sitc.total === 0;
  const negeriMax = useMemo(() => Math.max(...sitc.negeri.map(n => n.value), 1), [sitc.negeri]);

  const visibleNegeri = showAll ? sitc.negeri : sitc.negeri.slice(0, DEFAULT_TOP);
  const hasMore = sitc.negeri.length > DEFAULT_TOP;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: sitc.num * 0.04 }}
      className={`rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col ${isEmpty ? 'opacity-40' : ''}`}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ background: ACCENT.headerBg }}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded text-primary-foreground"
            style={{ background: ACCENT.badge }}
          >
            {sitc.code}
          </span>
        </div>
        <h3 className="text-xs font-semibold leading-snug text-primary">{sitc.label}</h3>
        <p className="text-lg font-bold mt-1 text-primary">
          {isEmpty ? '–' : formatRM(sitc.total)}
        </p>
      </div>

      {/* Tree body */}
      {!isEmpty && (
        <div className="px-3 py-3 flex-1 overflow-y-auto max-h-[500px] space-y-1">
          {visibleNegeri.map(neg => {
            const negPct = (neg.value / negeriMax) * 100;
            const kwMax = Math.max(...neg.kawasan.map(k => k.value), 1);

            return (
              <ExpandableRow
                key={neg.name}
                label={neg.name}
                value={neg.value}
                pct={negPct}
                depth={0}
                hasChildren={neg.kawasan.some(k => k.value > 0)}
              >
                {neg.kawasan.filter(k => k.value > 0).map(kw => {
                  const kwPct = (kw.value / kwMax) * 100;
                  const szMax = Math.max(...kw.saiz.map(s => s.value), 1);

                  return (
                    <ExpandableRow
                      key={kw.name}
                      label={kw.name}
                      value={kw.value}
                      pct={kwPct}
                      depth={1}
                      hasChildren={kw.saiz.some(s => s.value > 0)}
                    >
                      {kw.saiz.filter(s => s.value > 0).map(sz => (
                        <ExpandableRow
                          key={sz.name}
                          label={sz.name}
                          value={sz.value}
                          pct={(sz.value / szMax) * 100}
                          depth={2}
                        />
                      ))}
                    </ExpandableRow>
                  );
                })}
              </ExpandableRow>
            );
          })}

          {hasMore && (
            <button
              onClick={() => setShowAll(p => !p)}
              className="text-[10px] font-medium text-primary hover:underline mt-1 pl-4"
            >
              {showAll ? '▲ Tunjuk 4 teratas' : `▼ Tunjuk semua ${sitc.negeri.length} negeri`}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Component ─── */
interface Props { data: TradeRecord[] }

export default function CommoditySunburst({ data }: Props) {
  const sitcPanels = useMemo<SITCData[]>(() => {
    const map: Record<string, TradeRecord[]> = {};
    SITC_RULES.forEach(r => { map[r.code] = []; });
    data.forEach(r => { map[getSITCCode(r.komoditiUtama)].push(r); });

    return SITC_RULES.map((rule) => {
      const records = map[rule.code];
      const total = records.reduce((s, r) => s + r.jumlahDaganganRM, 0);

      // Build: negeri → kawasan → saiz
      const tree: Record<string, Record<string, Record<string, number>>> = {};

      // Initialize all 17 states with all 4 kawasan and all saiz
      ALL_STATES.forEach(st => {
        tree[st] = {};
        KAWASAN_LIST.forEach(kw => {
          tree[st][kw] = {};
          SAIZ_LIST.forEach(sz => { tree[st][kw][sz] = 0; });
        });
      });

      records.forEach(r => {
        const negeri = ALL_STATES.includes(r.negeri) ? r.negeri : 'Supra';
        const kw = mapKawasan(negeri, r.kawasan);
        const sz = SAIZ_KEY_MAP[r.keluasanSyarikat] || 'Syarikat Besar';
        if (tree[negeri]?.[kw]) {
          tree[negeri][kw][sz] = (tree[negeri][kw][sz] || 0) + r.jumlahDaganganRM;
        }
      });

      const negeri: NegeriNode[] = ALL_STATES
        .map(nName => {
          const kawasan: KawasanNode[] = KAWASAN_LIST.map(kName => {
            const saiz: SaizNode[] = SAIZ_LIST
              .map(sName => ({ name: sName, value: tree[nName][kName][sName] || 0 }));
            return {
              name: kName,
              value: saiz.reduce((s, x) => s + x.value, 0),
              saiz,
            };
          });
          return {
            name: nName,
            value: kawasan.reduce((s, k) => s + k.value, 0),
            kawasan,
          };
        })
        .sort((a, b) => b.value - a.value);

      return { code: rule.code, num: rule.num, label: rule.label, total, negeri };
    });
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {sitcPanels.map(sitc => (
        <SITCPanel key={sitc.code} sitc={sitc} />
      ))}
    </div>
  );
}
