import React, { useMemo, useState } from 'react';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { motion } from 'framer-motion';

const COMMODITY_COLORS = [
  'hsl(24, 75%, 50%)', 'hsl(200, 65%, 50%)', 'hsl(340, 55%, 50%)',
  'hsl(155, 50%, 40%)', 'hsl(42, 70%, 50%)', 'hsl(280, 40%, 55%)',
  'hsl(187, 72%, 42%)', 'hsl(170, 50%, 45%)', 'hsl(30, 60%, 50%)',
  'hsl(100, 40%, 45%)',
];

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

export default function CommodityBarChart({ data }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const commodityData = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => {
      const name = r.komoditiUtama || 'Other';
      map[name] = (map[name] || 0) + r.jumlahDaganganRM;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  const maxValue = commodityData[0]?.value || 1;

  return (
    <div className="space-y-2.5">
      {commodityData.map((item, i) => {
        const widthPct = Math.max((item.value / maxValue) * 100, 3);
        const isHovered = hoveredIdx === i;
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="cursor-default"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium truncate max-w-[60%] transition-colors ${isHovered ? 'text-foreground' : 'text-muted-foreground'}`}>
                {item.name}
              </span>
              <span className="text-xs font-bold text-foreground">{formatRM(item.value)}</span>
            </div>
            <div className="h-6 bg-muted/50 rounded-lg overflow-hidden">
              <motion.div
                className="h-full rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: COMMODITY_COLORS[i % COMMODITY_COLORS.length],
                  opacity: hoveredIdx !== null && !isHovered ? 0.5 : 1,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
