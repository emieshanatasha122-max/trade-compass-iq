import React, { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'bm' | 'en';

interface Translations {
  [key: string]: { bm: string; en: string };
}

const translations: Translations = {
  dashboardTitle: { bm: 'Statistik Perdagangan Malaysia', en: 'Malaysia Trade Statistics' },
  dashboardSubtitle: { bm: 'Dagangan Mengikut Ciri-ciri Perusahaan', en: 'Trade by Enterprise Characteristics' },
  overview: { bm: 'Gambaran Keseluruhan', en: 'Overview' },
  publications: { bm: 'Penerbitan', en: 'Publications' },
  totalTradeValue: { bm: 'Jumlah Nilai Dagangan', en: 'Total Trade Value' },
  topState: { bm: 'Negeri Teratas', en: 'Top State' },
  topCommodity: { bm: 'Komoditi Teratas', en: 'Top Commodity' },
  smeContribution: { bm: 'Sumbangan PKS', en: 'SME Contribution' },
  tradeByState: { bm: 'Analisis Dagangan Negeri', en: 'Trade by State' },
  enterpriseStructure: { bm: 'Keluasan Syarikat', en: 'Enterprise Size Distribution' },
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
  tradeValue: { bm: 'Nilai Dagangan (RM)', en: 'Trade Value (RM)' },
  filters: { bm: 'Penapis', en: 'Filters' },
  articlesMedia: { bm: 'Artikel & Kenyataan Media Rasmi', en: 'Articles & Official Media Statements' },
  readMore: { bm: 'Baca Lagi', en: 'Read More' },
  mediaStatement: { bm: 'Kenyataan Media', en: 'Media Statement' },
  annualBook: { bm: 'Buku Tahunan', en: 'Annual Book' },
  askAboutTrade: { bm: 'Tanya saya tentang data dagangan! Ask me about trade data!', en: 'Ask me about trade data! Tanya saya tentang data dagangan!' },
  globalTradeMap: { bm: 'Peta Dagangan Global', en: 'Global Trade Map' },

  // Enterprise size labels
  large: { bm: 'Syarikat Besar', en: 'Large Enterprises' },
  smeMicro: { bm: 'PKS Mikro', en: 'Micro SMEs' },
  smeSmall: { bm: 'PKS Kecil', en: 'Small SMEs' },
  smeMedium: { bm: 'PKS Sederhana', en: 'Medium SMEs' },
  agents: { bm: 'Ejen Perdagangan', en: 'Trading Agents' },

  // Tooltip definitions
  tooltipSupra: { bm: 'Supra merujuk kepada dagangan yang tidak dapat dikenalpasti negeri asalnya.', en: 'Supra refers to trade that cannot be attributed to a specific state of origin.' },
  tooltipAgent: { bm: 'Ejen Perdagangan merujuk kepada syarikat yang bertindak sebagai perantara dalam urus niaga dagangan.', en: 'Trading Agents refer to companies acting as intermediaries in trade transactions.' },
  tooltipNES: { bm: 'NES bermaksud "Tidak Dinyatakan di Tempat Lain" — negara yang tidak diklasifikasikan secara khusus.', en: 'NES means "Not Elsewhere Specified" — countries not specifically classified.' },
  tooltipExportIntensity: { bm: 'Keamatan warna menunjukkan jumlah nilai eksport Malaysia ke setiap negara.', en: 'Color intensity shows total Malaysian export value to each country.' },

  exportIntensity: { bm: 'Keamatan Eksport', en: 'Export Intensity' },
  stateAnalysis: { bm: 'Analisis Dagangan Negeri', en: 'State Trade Analysis' },
};

// Map raw enterprise size keys to translation keys
export const ENTERPRISE_LABEL_MAP: Record<string, string> = {
  'LARGE': 'large',
  'SME_MICRO': 'smeMicro',
  'SME_SMALL': 'smeSmall',
  'SME_MEDIUM': 'smeMedium',
  'AGENTS': 'agents',
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
