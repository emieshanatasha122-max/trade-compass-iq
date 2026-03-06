import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import FilterBar from '@/components/FilterBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Brain, Lightbulb, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function formatRM(v: number) {
  if (v >= 1e9) return `RM ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `RM ${(v / 1e6).toFixed(1)}M`;
  return `RM ${v.toLocaleString()}`;
}

export default function TradeIntelligence() {
  const { filteredData } = useFilters();
  const { t, lang } = useLanguage();

  const insights = useMemo(() => {
    const stateMap: Record<string, number> = {};
    const commodityMap: Record<string, number> = {};
    const destMap: Record<string, number> = {};
    let smeTotal = 0, total = 0;

    filteredData.forEach(r => {
      stateMap[r.negeri] = (stateMap[r.negeri] || 0) + r.jumlahDaganganRM;
      commodityMap[r.komoditiUtama] = (commodityMap[r.komoditiUtama] || 0) + r.jumlahDaganganRM;
      if (r.destinasiEksport) destMap[r.destinasiEksport] = (destMap[r.destinasiEksport] || 0) + r.jumlahDaganganRM;
      if (r.keluasanSyarikat === 'PKS') smeTotal += r.jumlahDaganganRM;
      total += r.jumlahDaganganRM;
    });

    const topState = Object.entries(stateMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    const topComm = Object.entries(commodityMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    const topDest = Object.entries(destMap).sort((a, b) => b[1] - a[1]).slice(0, 2).map(d => d[0]).join(' & ') || '-';
    const smePct = total ? ((smeTotal / total) * 100).toFixed(0) : '0';

    if (lang === 'bm') {
      return [
        `${topState} mencatatkan nilai dagangan tertinggi.`,
        `${topComm} kekal sebagai komoditi dagangan dominan.`,
        `${topDest} merupakan destinasi eksport utama.`,
        `Perusahaan PKS menyumbang ${smePct}% daripada penyertaan dagangan.`,
      ];
    }
    return [
      `${topState} recorded the highest trade value.`,
      `${topComm} remains the dominant traded commodity.`,
      `${topDest} are the top export destinations.`,
      `SME enterprises contribute ${smePct}% of trade participation.`,
    ];
  }, [filteredData, lang]);

  const trendData = useMemo(() => {
    const map: Record<number, { eksport: number; import: number }> = {};
    filteredData.forEach(r => {
      if (!map[r.tahun]) map[r.tahun] = { eksport: 0, import: 0 };
      if (r.jenisDagangan === 'Eksport') map[r.tahun].eksport += r.jumlahDaganganRM;
      else map[r.tahun].import += r.jumlahDaganganRM;
    });
    return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0])).map(([year, v]) => ({ year, ...v }));
  }, [filteredData]);

  const topCommodities = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(r => { map[r.komoditiUtama] = (map[r.komoditiUtama] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const topDestinations = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.filter(r => r.destinasiEksport).forEach(r => { map[r.destinasiEksport] = (map[r.destinasiEksport] || 0) + r.jumlahDaganganRM; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const suggestedQuestions = lang === 'bm'
    ? ['Negeri mana paling tinggi eksport?', 'Apakah komoditi utama bagi Selangor?', 'Apakah destinasi eksport utama?', 'Trend sumbangan PKS dari 2014–2024']
    : ['Which state has the highest export?', 'What is the main commodity for Selangor?', 'Top export destination for Malaysia?', 'SME contribution trend from 2014–2024'];

  const tooltipStyle = { background: 'hsl(222, 47%, 14%)', border: '1px solid hsl(222, 30%, 22%)', borderRadius: '8px', fontSize: '11px', color: 'hsl(210, 40%, 98%)' };

  return (
    <div>
      <FilterBar />

      {/* AI Insights Panel */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card mb-4 cyan-glow">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t('aiInsights')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-secondary-foreground bg-secondary/50 rounded-lg p-2.5">
              <Lightbulb className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              {insight}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('tradeTrend')} — {t('exportVsImport')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} tickFormatter={v => formatRM(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatRM(v)]} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="eksport" stroke="hsl(187, 92%, 55%)" strokeWidth={2} name={t('export')} />
              <Line type="monotone" dataKey="import" stroke="hsl(200, 80%, 50%)" strokeWidth={2} name={t('import')} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('topCommodities')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCommodities} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} tickFormatter={v => formatRM(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215, 20%, 55%)' }} width={130} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatRM(v)]} />
              <Bar dataKey="value" fill="hsl(160, 60%, 45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="chart-container lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('tradeFlowAnalysis')} — {t('topDestinations')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topDestinations} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} tickFormatter={v => formatRM(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} width={110} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatRM(v)]} />
              <Bar dataKey="value" fill="hsl(187, 92%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Suggested Questions */}
        <div className="chart-container">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{t('suggestedQuestions')}</h3>
          </div>
          <div className="space-y-2">
            {suggestedQuestions.map((q, i) => (
              <button key={i} className="w-full text-left text-xs p-2.5 rounded-lg bg-secondary/50 text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
