import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { motion } from 'framer-motion';

const STATE_FLAG_FILES: Record<string, string> = {
  Selangor: '/flags/Selangor.svg',
  Johor: '/flags/Johor.svg',
  'Pulau Pinang': '/flags/Pulau_Pinang.svg',
  Sarawak: '/flags/Sarawak.svg',
  Sabah: '/flags/Sabah.svg',
  Perak: '/flags/Perak.svg',
  Kedah: '/flags/Kedah.svg',
  Pahang: '/flags/Pahang.svg',
  Kelantan: '/flags/Kelantan.svg',
  Terengganu: '/flags/Terengganu.svg',
  Melaka: '/flags/Melaka.svg',
  'Negeri Sembilan': '/flags/Negeri_Sembilan.svg',
  Perlis: '/flags/Perlis.svg',
  'W.P. Kuala Lumpur': '/flags/WP_Kuala_Lumpur.svg',
  'W.P. Labuan': '/flags/WP_Labuan.svg',
  'W.P. Putrajaya': '/flags/WP_Putrajaya.svg',
};

function formatRM(value: number, lang: string): string {
  if (lang === 'bm') {
    if (value >= 1e12) return `RM${(value / 1e12).toFixed(1)} trilion`;
    if (value >= 1e9) return `RM${(value / 1e9).toFixed(1)} bilion`;
    if (value >= 1e6) return `RM${(value / 1e6).toFixed(1)} juta`;
  } else {
    if (value >= 1e12) return `RM${(value / 1e12).toFixed(1)} trillion`;
    if (value >= 1e9) return `RM${(value / 1e9).toFixed(1)} billion`;
    if (value >= 1e6) return `RM${(value / 1e6).toFixed(1)} million`;
  }

  return `RM${value.toLocaleString()}`;
}

function FlagImage({ stateName }: { stateName: string }) {
  const [hasError, setHasError] = useState(false);
  const src = STATE_FLAG_FILES[stateName];

  if (!src || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted">
        <span className="text-xs font-semibold text-muted-foreground">
          {stateName}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Flag of ${stateName}`}
      className="h-full w-full object-cover flag-wave"
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
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const stateData = useMemo(() => {
    const map: Record<
      string,
      { value: number; records: number; commodities: Record<string, number> }
    > = {};

    data.forEach((r) => {
      if (!map[r.negeri]) {
        map[r.negeri] = { value: 0, records: 0, commodities: {} };
      }

      map[r.negeri].value += r.jumlahDaganganRM;
      map[r.negeri].records += 1;
      map[r.negeri].commodities[r.komoditiUtama] =
        (map[r.negeri].commodities[r.komoditiUtama] || 0) +
        r.jumlahDaganganRM;
    });

    const total = Object.values(map).reduce((a, b) => a + b.value, 0);

    return Object.entries(map)
      .sort((a, b) => b[1].value - a[1].value)
      .map(([name, d]) => {
        const topCommodity = Object.entries(d.commodities).sort(
          (a, b) => b[1] - a[1]
        )[0];

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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {stateData.map((state, i) => {
        const isHovered = hoveredState === state.name;

        return (
          <motion.div
            key={state.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onMouseEnter={() => setHoveredState(state.name)}
            onMouseLeave={() => setHoveredState(null)}
            className="group relative cursor-default rounded-xl border border-border bg-card p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
          >
            {/* Official Flag */}
            <div className="mb-3 aspect-[3/2] w-full overflow-hidden rounded-lg border border-border/50">
              <FlagImage stateName={state.name} />
            </div>

            {/* State name */}
            <p className="truncate text-center text-base font-semibold text-primary">
              {state.name}
            </p>

            {/* Trade value */}
            <p className="mt-1 text-center text-sm font-medium text-muted-foreground dark:text-white">
              {formatRM(state.value, lang)}
            </p>

            {/* Hover overlay with details */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-card/95 px-3 backdrop-blur-sm transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <p className="text-sm font-semibold text-foreground">
                {state.name}
              </p>

              <p className="mt-1 text-2xl font-bold text-primary">
                {state.pct}%
              </p>

              <p className="text-[10px] text-muted-foreground">
                {lang === 'bm' ? 'Sumbangan Perdagangan' : 'Trade Share'}
              </p>

              <p className="mt-1 text-sm font-semibold text-foreground">
                {formatRM(state.value, lang)}
              </p>

              <div className="mt-2 w-full space-y-1 border-t border-border/50 pt-2">
                <p className="text-center text-sm">
                  <span className="block font-semibold text-primary">
                    {lang === 'bm' ? 'Komoditi Utama:' : 'Top Commodity:'}
                  </span>

                  <span className="block font-medium text-muted-foreground dark:text-white">
                    {state.topCommodity.length > 25
                      ? state.topCommodity.slice(0, 25) + '…'
                      : state.topCommodity}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}