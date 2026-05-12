import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Lang = 'bm' | 'en';

interface Translations {
  [key: string]: { bm: string; en: string };
}

const translations: Translations = {
  dashboardTitle: { bm: 'Prestasi Perdagangan Malaysia', en: 'Malaysia Trade Performance' },
  dashboardSubtitle: { bm: 'Visualisasi interaktif prestasi eksport dan import Malaysia (2014-2024). Analisis mendalam mengikut negeri, saiz syarikat, dan kategori komoditi utama.', en: "Interactive visualization of Malaysia's export and import performance (2014-2024). In-depth analysis by state, company size, and key commodity categories." },
  overview: { bm: 'Gambaran Keseluruhan', en: 'Overview' },
  publications: { bm: 'Penerbitan', en: 'Publications' },

  tradeOverview: { bm: 'Gambaran Perdagangan', en: 'Trade Overview' },
  tradeOverviewDesc: { bm: 'Gambaran ringkas prestasi Perdagangan keseluruhan Malaysia.', en: 'A quick snapshot of Malaysia\'s overall trade performance.' },
  totalTradeValue: { bm: 'Jumlah Perdagangan', en: 'Total Trade' },
  totalExportValue: { bm: 'Jumlah Eksport', en: 'Total Export' },
  totalImportValue: { bm: 'Jumlah Import', en: 'Total Import' },
  tradeBalance: { bm: 'Imbangan Perdagangan', en: 'Trade Balance' },
  tooltipTradeBalance: { bm: 'Perbezaan antara nilai eksport dan import. Positif bermaksud lebihan Perdagangan.', en: 'Difference between export and import values. Positive means trade surplus.' },
  top3States: { bm: 'Negeri Utama Perdagangan', en: 'Major Trade by States' },
  top3Commodities: { bm: 'Komoditi Utama', en: 'Major Commodities' },
  topTradingState: { bm: 'Negeri Perdagangan Teratas', en: 'Top Trading State' },
  topSITCCategory: { bm: 'Komoditi SITC Teratas', en: 'Top SITC Category' },
  mainEnterpriseSize: { bm: 'Saiz Perusahaan Utama', en: 'Main Enterprise Size' },
  tooltipTotalTrade: { bm: 'Jumlah Nilai Perdagangan mewakili gabungan nilai eksport dan import Malaysia.', en: 'Total Trade Value represents the combined value of Malaysia\'s exports and imports.' },
  tooltipExport: { bm: 'Jumlah nilai barangan yang dieksport oleh Malaysia.', en: 'Total value of goods exported by Malaysia.' },
  tooltipImport: { bm: 'Jumlah nilai barangan yang diimport oleh Malaysia.', en: 'Total value of goods imported by Malaysia.' },
  tooltipTopState: { bm: 'Negeri yang menyumbang paling besar kepada Perdagangan.', en: 'The state contributing the most to trade value.' },
  tooltipTopSITC: { bm: 'Kategori komoditi dengan nilai Perdagangan tertinggi.', en: 'Commodity category with the highest trade value.' },
  tooltipMainEnterprise: { bm: 'Saiz perusahaan yang menyumbang paling besar.', en: 'Enterprise size contributing the most to trade.' },

  globalTradeMap: { bm: 'Pemetaan Perdagangan Global', en: 'Global Trade Mapping' },
  globalTradeMapDesc: { bm: 'Peta menggambarkan hubungan perdagangan Malaysia di peringkat global', en: 'Map illustrates Malaysia’s trade relationships at global level' },

  tradeTrends: { bm: 'Analisis Trend Perdagangan', en: 'Trade Trend Analysis' },
  tradeTrendsDesc: { bm: 'Graf garis menunjukkan trend perdagangan mengikut tahun dan bulan (Klik pada titik tahun untuk melihat perincian bulanan)', en: 'Line graph shows the trade trend by year and month (Click a year point to drill into the monthly breakdown)' },
  monthlyTrend: { bm: 'Trend Bulanan', en: 'Monthly Trend' },
  yearlyTrend: { bm: 'Trend Tahunan', en: 'Yearly Trend' },

  stateActivity: { bm: 'Perdagangan Mengikut Negeri', en: 'Trade by State' },
  stateActivityDesc: { bm: 'Paparan menunjukkan jumlah perdagangan bagi setiap negeri', en: 'Exhibit displays total trade by each state' },

  commodityStructure: { bm: 'Analisis Komoditi', en: 'Commodity Analysis' },
  commodityStructureDesc: { bm: 'Bahagian ini menunjukkan kategori komoditi teratas mengikut nilai Perdagangan.', en: 'This section shows the top commodity categories by trade value.' },
  topCommodities: { bm: 'Komoditi Teratas', en: 'Top Commodities' },

  enterpriseParticipation: { bm: 'Penyertaan Perusahaan', en: 'Enterprise Participation' },
  enterpriseParticipationDesc: { bm: 'Bahagian ini menunjukkan bagaimana syarikat pelbagai saiz mengambil bahagian dalam Perdagangan.', en: 'This section shows how companies of different sizes participate in trade.' },
  enterpriseStructure: { bm: 'Size Syarikat', en: 'Company Size' },
  economicRegion: { bm: 'Taburan Kawasan Ekonomi', en: 'Economic Region Distribution' },
  economicRegionDesc: { bm: 'Taburan Perdagangan mengikut kawasan ekonomi.', en: 'Trade distribution by economic region.' },

  topTradeRankings: { bm: 'Kedudukan Perdagangan Teratas', en: 'Top Trade Rankings' },
  topTradeRankingsDesc: { bm: 'Negara dan komoditi teratas mengikut nilai Perdagangan.', en: 'Top countries and commodities by trade value.' },
  top10Countries: { bm: '10 Negara Perdagangan Teratas', en: 'Top 10 Trading Countries' },
  top10Commodities: { bm: '10 Komoditi Teratas', en: 'Top 10 Commodity Products' },

  tradeByState: { bm: 'Analisis Perdagangan Negeri', en: 'Trade by State' },
  exportDashboard: { bm: 'Eksport ke PDF', en: 'Export to PDF' },
  year: { bm: 'Tahun', en: 'Year' },
  month: { bm: 'Bulan', en: 'Month' },
  tradeType: { bm: 'Jenis Perdagangan', en: 'Trade Type' },
  state: { bm: 'Negeri', en: 'State' },
  commodity: { bm: 'Komoditi', en: 'Commodity' },
  enterpriseSize: { bm: 'Size Syarikat', en: 'Company Size' },
  all: { bm: 'Semua', en: 'All' },
  export: { bm: 'Eksport', en: 'Export' },
  import: { bm: 'Import', en: 'Import' },
  tradeValue: { bm: 'Nilai Perdagangan (RM)', en: 'Trade Value (RM)' },
  filters: { bm: 'Penapis', en: 'Filters' },
  articlesMedia: { bm: 'Artikel & Kenyataan Media Rasmi', en: 'Articles & Official Media Statements' },
  readMore: { bm: 'Baca Lagi', en: 'Read More' },
  mediaStatement: { bm: 'Kenyataan Media', en: 'Media Statement' },
  annualBook: { bm: 'Buku Tahunan', en: 'Annual Book' },
  askAboutTrade: { bm: 'Tanya saya tentang data Perdagangan!', en: 'Ask me about trade data!' },
  shareOfTrade: { bm: 'Bahagian Perdagangan', en: 'Share of Trade' },

  large: { bm: 'Syarikat Besar', en: 'Large Enterprises' },
  smeMicro: { bm: 'PKS Mikro', en: 'Micro SMEs' },
  smeSmall: { bm: 'PKS Kecil', en: 'Small SMEs' },
  smeMedium: { bm: 'PKS Sederhana', en: 'Medium SMEs' },
  agents: { bm: 'Ejen Perdagangan', en: 'Trading Agents' },

  semenanjung: { bm: 'Semenanjung Malaysia', en: 'Peninsular Malaysia' },
  sabah: { bm: 'Sabah', en: 'Sabah' },
  sarawak: { bm: 'Sarawak', en: 'Sarawak' },
  zonBebas: { bm: 'Zon Bebas', en: 'Free Zone' },

  exportIntensity: { bm: 'Keamatan Eksport', en: 'Export Intensity' },
  searchCountry: { bm: 'Cari Negara', en: 'Search Country' },
  searchCountryPlaceholder: { bm: 'Taip nama negara...', en: 'Type country name...' },
  allCountries: { bm: '— Semua Negara —', en: '— All Countries —' },
  highValue: { bm: 'Nilai Tinggi', en: 'High Value' },
  lowValue: { bm: 'Nilai Rendah', en: 'Low Value' },
  storyEnd: { bm: 'Data → Wawasan → Pemahaman Ekonomi Lebih Baik', en: 'Data → Insight → Better Economic Understanding' },
  loadingData: { bm: 'Memuatkan data Perdagangan...', en: 'Loading trade data...' },

  sitc0: { bm: 'Makanan & Binatang Hidup', en: 'Food & Live Animals' },
  sitc1: { bm: 'Minuman & Tembakau', en: 'Beverages & Tobacco' },
  sitc2: { bm: 'Bahan Mentah Tak Boleh Dimakan', en: 'Crude Materials, Inedible' },
  sitc3: { bm: 'Bahan Api Mineral & Pelincir', en: 'Mineral Fuels & Lubricants' },
  sitc4: { bm: 'Minyak & Lemak Binatang/Tumbuhan', en: 'Animal & Vegetable Oils' },
  sitc5: { bm: 'Bahan Kimia & Produk Berkaitan', en: 'Chemicals & Related Products' },
  sitc6: { bm: 'Barang Dikilang (Kayu, Logam, Getah)', en: 'Manufactured Goods (Wood, Metal, Rubber)' },
  sitc7: { bm: 'Jentera & Pengangkutan (E&E)', en: 'Machinery & Transport Equipment (E&E)' },
  sitc8: { bm: 'Pelbagai Barang Dikilang', en: 'Miscellaneous Manufactured Articles' },
  sitc9: { bm: 'Lain-lain Komoditi', en: 'Other Commodities' },

  radarTotalTrade: { bm: 'Jumlah Perdagangan', en: 'Total Trade' },
  radarContribution: { bm: 'Sumbangan', en: 'Contribution' },
  radarTopAttributes: { bm: 'Atribut Utama', en: 'Top Attributes' },
  radarPrimaryState: { bm: 'Negeri Utama', en: 'Primary State' },
  radarRegion: { bm: 'Kawasan', en: 'Region' },
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

export const ENTERPRISE_LABEL_MAP: Record<string, Record<string, string>> = {
  'LARGE': { bm: 'Syarikat Besar', en: 'Large Enterprises' },
  'SME_MICRO': { bm: 'PKS Mikro', en: 'Micro SMEs' },
  'SME_SMALL': { bm: 'PKS Kecil', en: 'Small SMEs' },
  'SME_MEDIUM': { bm: 'PKS Sederhana', en: 'Medium SMEs' },
  'SME MICRO': { bm: 'PKS Mikro', en: 'Micro SMEs' },
  'SME SMALL': { bm: 'PKS Kecil', en: 'Small SMEs' },
  'SME MEDIUM': { bm: 'PKS Sederhana', en: 'Medium SMEs' },
  'AGENTS': { bm: 'Ejen', en: 'Agents' },
};
