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

  tradeOverview: { bm: 'Gambaran Dagangan', en: 'Trade Overview' },
  tradeOverviewDesc: { bm: 'Gambaran ringkas prestasi dagangan keseluruhan Malaysia.', en: 'A quick snapshot of Malaysia\'s overall trade performance.' },
  totalTradeValue: { bm: 'Jumlah Nilai Dagangan', en: 'Total Trade Value' },
  totalExportValue: { bm: 'Jumlah Nilai Eksport', en: 'Total Export Value' },
  totalImportValue: { bm: 'Jumlah Nilai Import', en: 'Total Import Value' },
  tradeBalance: { bm: 'Imbangan Dagangan', en: 'Trade Balance' },
  tooltipTradeBalance: { bm: 'Perbezaan antara nilai eksport dan import. Positif bermaksud lebihan dagangan.', en: 'Difference between export and import values. Positive means trade surplus.' },
  top3States: { bm: '3 Negeri Teratas', en: 'Top 3 States' },
  top3Commodities: { bm: '3 Komoditi Teratas', en: 'Top 3 Commodities' },
  topTradingState: { bm: 'Negeri Dagangan Teratas', en: 'Top Trading State' },
  topSITCCategory: { bm: 'Komoditi SITC Teratas', en: 'Top SITC Category' },
  mainEnterpriseSize: { bm: 'Saiz Perusahaan Utama', en: 'Main Enterprise Size' },
  tooltipTotalTrade: { bm: 'Jumlah Nilai Dagangan mewakili gabungan nilai eksport dan import Malaysia.', en: 'Total Trade Value represents the combined value of Malaysia\'s exports and imports.' },
  tooltipExport: { bm: 'Jumlah nilai barangan yang dieksport oleh Malaysia.', en: 'Total value of goods exported by Malaysia.' },
  tooltipImport: { bm: 'Jumlah nilai barangan yang diimport oleh Malaysia.', en: 'Total value of goods imported by Malaysia.' },
  tooltipTopState: { bm: 'Negeri yang menyumbang paling besar kepada dagangan.', en: 'The state contributing the most to trade value.' },
  tooltipTopSITC: { bm: 'Kategori komoditi dengan nilai dagangan tertinggi.', en: 'Commodity category with the highest trade value.' },
  tooltipMainEnterprise: { bm: 'Saiz perusahaan yang menyumbang paling besar.', en: 'Enterprise size contributing the most to trade.' },

  globalTradeMap: { bm: 'Pemetaan Dagangan Global', en: 'Global Trade Mapping' },
  globalTradeMapDesc: { bm: 'Peta ini menggambarkan hubungan dagangan global Malaysia dan destinasi eksport utama.', en: 'This map illustrates Malaysia\'s global trade connections and major export destinations.' },

  tradeTrends: { bm: 'Analisis Trend Dagangan', en: 'Trade Trend Analysis' },
  tradeTrendsDesc: { bm: 'Klik pada titik tahun untuk melihat pecahan bulanan.', en: 'Click a year point to drill into the monthly breakdown.' },
  monthlyTrend: { bm: 'Trend Bulanan', en: 'Monthly Trend' },
  yearlyTrend: { bm: 'Trend Tahunan', en: 'Yearly Trend' },

  stateActivity: { bm: 'Dagangan Mengikut Negeri', en: 'Trade by State' },
  stateActivityDesc: { bm: 'Visualisasi ini menyerlahkan negeri mana yang memainkan peranan terbesar dalam dagangan antarabangsa Malaysia.', en: 'This visualization highlights which states play the biggest role in Malaysia\'s international trade.' },

  commodityStructure: { bm: 'Analisis Komoditi', en: 'Commodity Analysis' },
  commodityStructureDesc: { bm: 'Bahagian ini menunjukkan kategori komoditi teratas mengikut nilai dagangan.', en: 'This section shows the top commodity categories by trade value.' },
  topCommodities: { bm: 'Komoditi Teratas', en: 'Top Commodities' },

  enterpriseParticipation: { bm: 'Penyertaan Perusahaan', en: 'Enterprise Participation' },
  enterpriseParticipationDesc: { bm: 'Bahagian ini menunjukkan bagaimana syarikat pelbagai saiz mengambil bahagian dalam dagangan.', en: 'This section shows how companies of different sizes participate in trade.' },
  enterpriseStructure: { bm: 'Taburan Keluasan Syarikat', en: 'Enterprise Size Distribution' },
  economicRegion: { bm: 'Taburan Kawasan Ekonomi', en: 'Economic Region Distribution' },
  economicRegionDesc: { bm: 'Taburan dagangan mengikut kawasan ekonomi.', en: 'Trade distribution by economic region.' },

  topTradeRankings: { bm: 'Kedudukan Dagangan Teratas', en: 'Top Trade Rankings' },
  topTradeRankingsDesc: { bm: 'Negara dan komoditi teratas mengikut nilai dagangan.', en: 'Top countries and commodities by trade value.' },
  top10Countries: { bm: '10 Negara Dagangan Teratas', en: 'Top 10 Trading Countries' },
  top10Commodities: { bm: '10 Komoditi Teratas', en: 'Top 10 Commodity Products' },

  tradeByState: { bm: 'Analisis Dagangan Negeri', en: 'Trade by State' },
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
  askAboutTrade: { bm: 'Tanya saya tentang data dagangan!', en: 'Ask me about trade data!' },
  shareOfTrade: { bm: 'Bahagian Dagangan', en: 'Share of Trade' },

  large: { bm: 'Syarikat Besar', en: 'Large Enterprises' },
  smeMicro: { bm: 'PKS Mikro', en: 'Micro SMEs' },
  smeSmall: { bm: 'PKS Kecil', en: 'Small SMEs' },
  smeMedium: { bm: 'PKS Sederhana', en: 'Medium SMEs' },
  agents: { bm: 'Ejen Perdagangan', en: 'Trading Agents' },

  semenanjung: { bm: 'Semenanjung Malaysia', en: 'Peninsular Malaysia' },
  sabah: { bm: 'Sabah', en: 'Sabah' },
  sarawak: { bm: 'Sarawak', en: 'Sarawak' },
  zonBebas: { bm: 'Zon Bebas', en: 'Free Zone' },

  tooltipSupra: { bm: 'Supra merujuk kepada dagangan yang tidak dapat dikenalpasti negeri asalnya.', en: 'Supra refers to trade that cannot be attributed to a specific state of origin.' },
  tooltipAgent: { bm: 'Ejen Perdagangan merujuk kepada syarikat yang bertindak sebagai perantara dalam urus niaga dagangan.', en: 'Trading Agents refer to companies acting as intermediaries in trade transactions.' },
  tooltipNES: { bm: 'NES bermaksud "Tidak Dinyatakan di Tempat Lain".', en: 'NES means "Not Elsewhere Specified".' },
  tooltipExportIntensity: { bm: 'Keamatan warna menunjukkan jumlah nilai eksport Malaysia ke setiap negara.', en: 'Color intensity shows total Malaysian export value to each country.' },

  exportIntensity: { bm: 'Keamatan Eksport', en: 'Export Intensity' },
  searchCountry: { bm: 'Cari Negara', en: 'Search Country' },
  searchCountryPlaceholder: { bm: 'Taip nama negara...', en: 'Type country name...' },
  allCountries: { bm: '— Semua Negara —', en: '— All Countries —' },
  highValue: { bm: 'Nilai Tinggi', en: 'High Value' },
  lowValue: { bm: 'Nilai Rendah', en: 'Low Value' },
  storyEnd: { bm: 'Data → Wawasan → Pemahaman Ekonomi Lebih Baik', en: 'Data → Insight → Better Economic Understanding' },
  loadingData: { bm: 'Memuatkan data dagangan...', en: 'Loading trade data...' },

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

  radarTotalTrade: { bm: 'Jumlah Dagangan', en: 'Total Trade' },
  radarContribution: { bm: 'Sumbangan', en: 'Contribution' },
  radarTopAttributes: { bm: 'Atribut Utama', en: 'Top Attributes' },
  radarPrimaryState: { bm: 'Negeri Utama', en: 'Primary State' },
  radarRegion: { bm: 'Kawasan', en: 'Region' },
};

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
