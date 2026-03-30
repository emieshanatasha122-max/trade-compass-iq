import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { motion } from 'framer-motion';

const STATE_FLAG_FILES: Record<string, string> = {
  'Selangor': '/flags/Selangor.svg',
  'Johor': '/flags/Johor.svg',
  'Pulau Pinang': '/flags/Pulau_Pinang.svg',
  'Sarawak': '/flags/Sarawak.svg',
  'Sabah': '/flags/Sabah.svg',
  'Perak': '/flags/Perak.svg',
  'Kedah': '/flags/Kedah.svg',
  'Pahang': '/flags/Pahang.svg',
  'Kelantan': '/flags/Kelantan.svg',
  'Terengganu': '/flags/Terengganu.svg',
  'Melaka': '/flags/Melaka.svg',
  'Negeri Sembilan': '/flags/Negeri_Sembilan.svg',
  'Perlis': '/flags/Perlis.svg',
  'W.P. Kuala Lumpur': '/flags/WP_Kuala_Lumpur.svg',
  'W.P. Labuan': '/flags/WP_Labuan.svg',
  'W.P. Putrajaya': '/flags/WP_Putrajaya.svg',
};

function formatRM(value: number, lang: string): string {
  if (lang === 'bm') {
    if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)} Trilion`;
    if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)} Bilion`;
    if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)} Juta`;
  } else {
    if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)} Trillion`;
    if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)} Billion`;
    if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)} Million`;
  }
  return `RM ${value.toLocaleString()}`;
}

function FlagImage({ stateName }: { stateName: string }) {
  const [hasError, setHasError] = useState(false);
  const src = STATE_FLAG_FILES[stateName];

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <span className="text-xs font-semibold text-muted-foreground">{stateName}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Flag of ${stateName}`}
      className="w-full h-full object-cover flag-wave"
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}

interface Props {
  data: TradeRecord[];
}

export default function StateFlagGrid({ data }: Props) {
  const { lang } = useLanguage();

  const stateData = useMemo(() => {
    const map: Record<string, { value: number; records: number; commodities: Record<string, number> }> = {};
    data.forEach(r => {
      if (!map[r.negeri]) map[r.negeri] = { value: 0, records: 0, commodities: {} };
      map[r.negeri].value += r.jumlahDaganganRM;
      map[r.negeri].records += 1;
      map[r.negeri].commodities[r.komoditiUtama] = (map[r.negeri].commodities[r.komoditiUtama] || 0) + r.jumlahDaganganRM;
    });
    const total = Object.values(map).reduce((a, b) => a + b.value, 0);
    return Object.entries(map)
      .sort((a, b) => b[1].value - a[1].value)
      .map(([name, d]) => {
        const topCommodity = Object.entries(d.commodities).sort((a, b) => b[1] - a[1])[0];
        return {
          name,
          value: d.value,
          records: d.records,
          pct: total > 0 ? ((d.value / total) * 100).toFixed(1) : '0',
          topCommodity: topCommodity ? topCommodity[0] : '-',
        };
      });
  }, [data]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {stateData.map((state, i) => {
        return (
          <motion.div
            key={state.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl border border-border bg-card p-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            {/* Official Flag */}
            <div className="w-full aspect-[3/2] rounded-lg overflow-hidden mb-3 border border-border/50">
              <FlagImage stateName={state.name} />
            </div>

            {/* State name */}
            <p className="text-xs font-medium text-muted-foreground text-center truncate">{state.name}</p>

            {/* Trade value - large bold */}
            <p className="text-base font-bold text-primary text-center mt-0.5">{formatRM(state.value, lang)}</p>
          </motion.div>
        );
      })}
    </div>
  );
}