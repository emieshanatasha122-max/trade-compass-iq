import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const COLORS = [
  'hsl(207, 70%, 50%)', 'hsl(24, 85%, 55%)', 'hsl(145, 55%, 42%)',
  'hsl(0, 65%, 55%)', 'hsl(270, 50%, 55%)', 'hsl(42, 75%, 50%)',
  'hsl(340, 60%, 52%)', 'hsl(187, 65%, 42%)', 'hsl(100, 45%, 45%)',
  'hsl(30, 70%, 48%)',
];

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

interface TreeNode {
  name: string;
  size: number;
  children?: TreeNode[];
}

function CustomContent({ x = 0, y = 0, width = 0, height = 0, name = '', index = 0 }: any) {
  if (width < 35 || height < 25) return null;
  const truncated = name.length > 18 ? name.slice(0, 18) + '…' : name;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4}
        fill={COLORS[index % COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />
      <text x={x + width / 2} y={y + height / 2} textAnchor="middle"
        dominantBaseline="central" fontSize={width > 70 ? 10 : 8} fontWeight={600} fill="#fff">
        {truncated}
      </text>
    </g>
  );
}

interface Props {
  data: TradeRecord[];
}

export default function DualTreeChart({ data }: Props) {
  const { lang } = useLanguage();
  const [popup, setPopup] = useState<{ region: string; states: { name: string; value: number }[]; type: string } | null>(null);

  const buildTree = (type: 'Eksport' | 'Import') => {
    const filtered = data.filter(r => r.jenisDagangan === type);
    const regionMap: Record<string, Record<string, number>> = {};

    filtered.forEach(r => {
      const region = r.kawasanEkonomi || 'Others';
      if (!regionMap[region]) regionMap[region] = {};
      regionMap[region][r.negeri] = (regionMap[region][r.negeri] || 0) + r.jumlahDaganganRM;
    });

    return Object.entries(regionMap)
      .map(([region, states]) => ({
        name: region,
        size: Object.values(states).reduce((a, b) => a + b, 0),
        states: Object.entries(states).sort((a, b) => b[1] - a[1]),
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
  };

  const exportTree = useMemo(() => buildTree('Eksport'), [data]);
  const importTree = useMemo(() => buildTree('Import'), [data]);

  const treemapData = (tree: ReturnType<typeof buildTree>) =>
    tree.map(n => ({ name: n.name, size: n.size }));

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'hsl(var(--foreground))',
  };

  const handleClick = (type: string, tree: ReturnType<typeof buildTree>) => (data: any) => {
    if (data?.name) {
      const node = tree.find(n => n.name === data.name);
      if (node) {
        setPopup({
          region: node.name,
          states: node.states.slice(0, 3).map(([name, value]) => ({ name, value })),
          type,
        });
      }
    }
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Tree */}
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[hsl(0,65%,55%)]" />
            {lang === 'bm' ? 'Import mengikut Kawasan Ekonomi' : 'Import by Economic Region'}
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <Treemap data={treemapData(importTree)} dataKey="size" nameKey="name"
              content={<CustomContent />} onClick={handleClick('Import', importTree)}>
              <Tooltip contentStyle={tooltipStyle}
                formatter={(value: number) => [formatRM(value), lang === 'bm' ? 'Nilai' : 'Value']} />
            </Treemap>
          </ResponsiveContainer>
        </div>

        {/* Export Tree */}
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[hsl(145,55%,42%)]" />
            {lang === 'bm' ? 'Eksport mengikut Kawasan Ekonomi' : 'Export by Economic Region'}
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <Treemap data={treemapData(exportTree)} dataKey="size" nameKey="name"
              content={<CustomContent />} onClick={handleClick('Export', exportTree)}>
              <Tooltip contentStyle={tooltipStyle}
                formatter={(value: number) => [formatRM(value), lang === 'bm' ? 'Nilai' : 'Value']} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popup for Top 3 States */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-card border border-border rounded-xl shadow-2xl p-4 w-72"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-bold text-foreground">{popup.region}</h5>
              <button onClick={() => setPopup(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">
              Top 3 {lang === 'bm' ? 'Negeri' : 'States'} ({popup.type})
            </p>
            <div className="space-y-2">
              {popup.states.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                    <span className="text-xs text-foreground">{s.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{formatRM(s.value)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
