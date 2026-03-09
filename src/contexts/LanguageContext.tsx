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

  // Section 1: Trade Overview
  tradeOverview: { bm: 'Gambaran Dagangan', en: 'Trade Overview Snapshot' },
  tradeOverviewDesc: { bm: 'Gambaran ringkas prestasi dagangan keseluruhan Malaysia.', en: 'A quick snapshot of Malaysia\'s overall trade performance.' },
  totalTradeValue: { bm: 'Jumlah Nilai Dagangan', en: 'Total Trade Value' },
  totalExportValue: { bm: 'Jumlah Nilai Eksport', en: 'Total Export Value' },
  totalImportValue: { bm: 'Jumlah Nilai Import', en: 'Total Import Value' },
  topTradingState: { bm: 'Negeri Dagangan Teratas', en: 'Top Trading State' },
  topState: { bm: 'Negeri Teratas', en: 'Top State' },
  topCommodity: { bm: 'Komoditi Teratas', en: 'Top Commodity' },
  smeContribution: { bm: 'Sumbangan PKS', en: 'SME Contribution' },
  tooltipTotalTrade: { bm: 'Jumlah Nilai Dagangan mewakili gabungan nilai eksport dan import Malaysia.', en: 'Total Trade Value represents the combined value of Malaysia\'s exports and imports.' },
  tooltipExport: { bm: 'Jumlah nilai barangan yang dieksport oleh Malaysia.', en: 'Total value of goods exported by Malaysia.' },
  tooltipImport: { bm: 'Jumlah nilai barangan yang diimport oleh Malaysia.', en: 'Total value of goods imported by Malaysia.' },
  tooltipTopState: { bm: 'Negeri yang menyumbang paling besar kepada dagangan.', en: 'The state contributing the most to trade value.' },

  // Section 2: Trade Trends
  tradeTrends: { bm: 'Trend Dagangan', en: 'Trade Trends Over Time' },
  tradeTrendsDesc: { bm: 'Bahagian ini menunjukkan bagaimana aktiviti dagangan Malaysia berubah dari tahun ke tahun, membantu mengenal pasti trend jangka panjang.', en: 'This section shows how Malaysia\'s trade activity evolves over time, helping users identify long-term trends.' },

  // Section 3: State Activity
  stateActivity: { bm: 'Aktiviti Dagangan Negeri', en: 'Trade Activity by State' },
  stateActivityDesc: { bm: 'Visualisasi ini menyerlahkan negeri mana yang memainkan peranan terbesar dalam dagangan antarabangsa Malaysia.', en: 'This visualization highlights which states play the biggest role in Malaysia\'s international trade.' },

  // Section 4: Commodity
  commodityStructure: { bm: 'Struktur Komoditi', en: 'Commodity Structure' },
  commodityStructureDesc: { bm: 'Bahagian ini menunjukkan industri mana yang menyumbang paling banyak kepada ekonomi dagangan Malaysia.', en: 'This section shows which industries contribute most to Malaysia\'s trade economy.' },

  // Section 5: Global Trade
  globalTradeMap: { bm: 'Hubungan Dagangan Global', en: 'Global Trade Connections' },
  globalTradeMapDesc: { bm: 'Peta ini menggambarkan hubungan dagangan global Malaysia dan destinasi eksport utama.', en: 'This map illustrates Malaysia\'s global trade connections and major export destinations.' },

  // Section 6: Enterprise
  enterpriseParticipation: { bm: 'Penyertaan Perusahaan', en: 'Enterprise Participation' },
  enterpriseParticipationDesc: { bm: 'Bahagian ini menunjukkan bagaimana syarikat pelbagai saiz mengambil bahagian dalam dagangan antarabangsa.', en: 'This section shows how companies of different sizes participate in international trade.' },
  enterpriseStructure: { bm: 'Keluasan Syarikat', en: 'Enterprise Size Distribution' },

  // Existing
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
  askAboutTrade: { bm: 'Tanya saya tentang data dagangan! Ask me about trade data!', en: 'Ask me about trade data! Tanya saya tentang data dagangan!' },
  shareOfTrade: { bm: 'Bahagian Dagangan', en: 'Share of Trade' },

  // Enterprise size labels
  large: { bm: 'Syarikat Besar', en: 'Large Enterprises' },
  smeMicro: { bm: 'PKS Mikro', en: 'Micro SMEs' },
  smeSmall: { bm: 'PKS Kecil', en: 'Small SMEs' },
  smeMedium: { bm: 'PKS Sederhana', en: 'Medium SMEs' },
  agents: { bm: 'Ejen Perdagangan', en: 'Trading Agents' },

  // Tooltips
  tooltipSupra: { bm: 'Supra merujuk kepada dagangan yang tidak dapat dikenalpasti negeri asalnya.', en: 'Supra refers to trade that cannot be attributed to a specific state of origin.' },
  tooltipAgent: { bm: 'Ejen Perdagangan merujuk kepada syarikat yang bertindak sebagai perantara dalam urus niaga dagangan.', en: 'Trading Agents refer to companies acting as intermediaries in trade transactions.' },
  tooltipNES: { bm: 'NES bermaksud "Tidak Dinyatakan di Tempat Lain" — negara yang tidak diklasifikasikan secara khusus.', en: 'NES means "Not Elsewhere Specified" — countries not specifically classified.' },
  tooltipExportIntensity: { bm: 'Keamatan warna menunjukkan jumlah nilai eksport Malaysia ke setiap negara. Garisan yang lebih tebal menunjukkan nilai dagangan yang lebih tinggi.', en: 'Color intensity shows total Malaysian export value to each country. Thicker lines represent higher trade values.' },

  exportIntensity: { bm: 'Keamatan Eksport', en: 'Export Intensity' },
  stateAnalysis: { bm: 'Analisis Dagangan Negeri', en: 'State Trade Analysis' },
  storyEnd: { bm: 'Data → Wawasan → Pemahaman Ekonomi Lebih Baik', en: 'Data → Insight → Better Economic Understanding' },

  // SITC labels
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

  // Radar tooltip labels
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
