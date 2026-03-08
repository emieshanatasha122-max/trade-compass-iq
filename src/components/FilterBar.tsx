import React from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useLanguage, ENTERPRISE_LABEL_MAP } from '@/contexts/LanguageContext';
import { Filter } from 'lucide-react';

const YEARS = Array.from({ length: 11 }, (_, i) => 2014 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const NEGERI = ['Selangor', 'Johor', 'Pulau Pinang', 'Sarawak', 'Sabah', 'Perak', 'Kedah', 'Pahang', 'Kelantan', 'Terengganu', 'Melaka', 'Negeri Sembilan', 'Perlis', 'W.P. Kuala Lumpur', 'W.P. Labuan', 'Supra'];
const KOMODITI = ['Elektrikal & Elektronik', 'Minyak Sawit', 'Petroleum', 'Jentera', 'Getah', 'Kimia', 'Kayu', 'Tekstil', 'Logam', 'Makanan'];
const KELUASAN_KEYS = ['LARGE', 'SME_MICRO', 'SME_SMALL', 'SME_MEDIUM', 'AGENTS'];

export default function FilterBar() {
  const { filters, setFilter } = useFilters();
  const { t } = useLanguage();

  const selectClass = "bg-card text-foreground border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="glass-panel p-3 mb-4 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 mr-1">
        <Filter className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground">{t('filters')}:</span>
      </div>

      <select value={filters.tahun} onChange={e => setFilter('tahun', e.target.value)} className={selectClass}>
        <option value="all">{t('year')} - {t('all')}</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>

      <select value={filters.bulan} onChange={e => setFilter('bulan', e.target.value)} className={selectClass}>
        <option value="all">{t('month')} - {t('all')}</option>
        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <select value={filters.jenisDagangan} onChange={e => setFilter('jenisDagangan', e.target.value)} className={selectClass}>
        <option value="all">{t('tradeType')} - {t('all')}</option>
        <option value="Eksport">{t('export')}</option>
        <option value="Import">{t('import')}</option>
      </select>

      <select value={filters.negeri} onChange={e => setFilter('negeri', e.target.value)} className={selectClass}>
        <option value="all">{t('state')} - {t('all')}</option>
        {NEGERI.map(n => <option key={n} value={n}>{n}</option>)}
      </select>

      <select value={filters.komoditi} onChange={e => setFilter('komoditi', e.target.value)} className={selectClass}>
        <option value="all">{t('commodity')} - {t('all')}</option>
        {KOMODITI.map(k => <option key={k} value={k}>{k}</option>)}
      </select>

      <select value={filters.keluasan} onChange={e => setFilter('keluasan', e.target.value)} className={selectClass}>
        <option value="all">{t('enterpriseSize')} - {t('all')}</option>
        {KELUASAN_KEYS.map(k => (
          <option key={k} value={k}>{t(ENTERPRISE_LABEL_MAP[k])}</option>
        ))}
      </select>
    </div>
  );
}
