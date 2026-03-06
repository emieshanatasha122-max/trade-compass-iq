import React, { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'bm' | 'en';

interface Translations {
  [key: string]: { bm: string; en: string };
}

const translations: Translations = {
  dashboardTitle: { bm: 'Statistik Perdagangan Malaysia', en: 'Malaysia Trade Statistics' },
  overview: { bm: 'Gambaran Keseluruhan', en: 'Overview' },
  regionalAnalysis: { bm: 'Analisis Wilayah', en: 'Regional Analysis' },
  enterpriseAnalysis: { bm: 'Analisis Perusahaan', en: 'Enterprise Analysis' },
  tradeIntelligence: { bm: 'Kecerdasan Dagangan', en: 'Trade Intelligence' },
  publications: { bm: 'Penerbitan', en: 'Publications' },
  totalTradeValue: { bm: 'Jumlah Nilai Dagangan', en: 'Total Trade Value' },
  topState: { bm: 'Negeri Teratas', en: 'Top State' },
  topCommodity: { bm: 'Komoditi Teratas', en: 'Top Commodity' },
  smeContribution: { bm: 'Sumbangan PKS', en: 'SME Contribution' },
  tradeByState: { bm: 'Analisis Dagangan Negeri', en: 'Trade by State' },
  enterpriseStructure: { bm: 'Struktur Keluasan Syarikat', en: 'Enterprise Structure' },
  exportDashboard: { bm: 'Eksport ke PDF', en: 'Export to PDF' },
  year: { bm: 'Tahun', en: 'Year' },
  month: { bm: 'Bulan', en: 'Month' },
  tradeType: { bm: 'Jenis Dagangan', en: 'Trade Type' },
  state: { bm: 'Negeri', en: 'State' },
  commodity: { bm: 'Komoditi', en: 'Commodity' },
  enterpriseSize: { bm: 'Keluasan Syarikat', en: 'Enterprise Size' },
  all: { bm: 'Semua', en: 'All' },
  export: { bm: 'Eksport', en: 'Export' },
  import: { bm: 'Import', en: 'Import' },
  tradeTrend: { bm: 'Trend Dagangan', en: 'Trade Trend' },
  topDestinations: { bm: 'Destinasi Eksport Utama', en: 'Top Export Destinations' },
  topCommodities: { bm: 'Komoditi Utama', en: 'Top Commodities' },
  enterpriseContribution: { bm: 'Sumbangan Perusahaan', en: 'Enterprise Contribution' },
  stateTradeRanking: { bm: 'Kedudukan Dagangan Negeri', en: 'State Trade Ranking' },
  tradeTrendByState: { bm: 'Trend Dagangan Mengikut Negeri', en: 'Trade Trend by State' },
  enterpriseTrend: { bm: 'Trend Perusahaan', en: 'Enterprise Trend' },
  aiInsights: { bm: 'Pandangan AI', en: 'AI Insights' },
  suggestedQuestions: { bm: 'Soalan Dicadangkan', en: 'Suggested Questions' },
  articlesMedia: { bm: 'Artikel & Kenyataan Media Rasmi', en: 'Articles & Official Media Statements' },
  readMore: { bm: 'Baca Lagi', en: 'Read More' },
  mediaStatement: { bm: 'Kenyataan Media', en: 'Media Statement' },
  annualBook: { bm: 'Buku Tahunan', en: 'Annual Book' },
  askAboutTrade: { bm: 'Tanya saya tentang data dagangan!', en: 'Ask me about trade data!' },
  large: { bm: 'Perusahaan Besar', en: 'Large Enterprise' },
  sme: { bm: 'PKS', en: 'SME' },
  micro: { bm: 'Mikro', en: 'Micro' },
  globalTradeMap: { bm: 'Peta Dagangan Global', en: 'Global Trade Map' },
  tradeValue: { bm: 'Nilai Dagangan (RM)', en: 'Trade Value (RM)' },
  exportVsImport: { bm: 'Eksport vs Import', en: 'Export vs Import' },
  tradeFlowAnalysis: { bm: 'Analisis Aliran Dagangan', en: 'Trade Flow Analysis' },
  filters: { bm: 'Penapis', en: 'Filters' },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('bm');

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
