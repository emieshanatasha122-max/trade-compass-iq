import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
  Graticule,
} from 'react-simple-maps';
import { ALPHA2_TO_ALPHA3 } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ─── Bloomberg-style trade arc colors ───
const EXPORT_CYAN = '#06B6D4';
const EXPORT_CYAN_END = '#0891B2';
const IMPORT_MAGENTA = '#EC4899';
const IMPORT_MAGENTA_END = '#DB2777';

// ISO numeric → alpha-3
const NUM_TO_ALPHA3: Record<string, string> = {
  '004': 'AFG', '008': 'ALB', '012': 'DZA', '024': 'AGO', '032': 'ARG',
  '036': 'AUS', '040': 'AUT', '050': 'BGD', '056': 'BEL', '064': 'BTN',
  '068': 'BOL', '076': 'BRA', '096': 'BRN', '100': 'BGR', '104': 'MMR',
  '116': 'KHM', '120': 'CMR', '124': 'CAN', '144': 'LKA', '152': 'CHL',
  '156': 'CHN', '158': 'TWN', '170': 'COL', '180': 'COD', '188': 'CRI',
  '191': 'HRV', '192': 'CUB', '196': 'CYP', '203': 'CZE', '208': 'DNK',
  '218': 'ECU', '231': 'ETH', '233': 'EST', '246': 'FIN', '250': 'FRA',
  '276': 'DEU', '288': 'GHA', '300': 'GRC', '320': 'GTM', '332': 'HTI',
  '340': 'HND', '344': 'HKG', '348': 'HUN', '352': 'ISL', '356': 'IND',
  '360': 'IDN', '364': 'IRN', '368': 'IRQ', '372': 'IRL', '376': 'ISR',
  '380': 'ITA', '388': 'JAM', '392': 'JPN', '400': 'JOR', '404': 'KEN',
  '410': 'KOR', '414': 'KWT', '418': 'LAO', '422': 'LBN', '434': 'LBY',
  '440': 'LTU', '442': 'LUX', '446': 'MAC', '458': 'MYS', '466': 'MLI',
  '484': 'MEX', '496': 'MNG', '504': 'MAR', '508': 'MOZ', '516': 'NAM',
  '524': 'NPL', '528': 'NLD', '554': 'NZL', '566': 'NGA', '578': 'NOR',
  '586': 'PAK', '591': 'PAN', '598': 'PNG', '600': 'PRY', '604': 'PER',
  '608': 'PHL', '616': 'POL', '620': 'PRT', '634': 'QAT', '642': 'ROU',
  '643': 'RUS', '682': 'SAU', '686': 'SEN', '690': 'SYC', '702': 'SGP',
  '703': 'SVK', '704': 'VNM', '705': 'SVN', '710': 'ZAF', '724': 'ESP',
  '740': 'SUR', '752': 'SWE', '756': 'CHE', '760': 'SYR', '764': 'THA',
  '780': 'TTO', '784': 'ARE', '788': 'TUN', '792': 'TUR', '800': 'UGA',
  '804': 'UKR', '818': 'EGY', '826': 'GBR', '834': 'TZA', '840': 'USA',
  '854': 'BFA', '858': 'URY', '860': 'UZB', '862': 'VEN', '887': 'YEM',
  '894': 'ZMB', '716': 'ZWE', '048': 'BHR', '512': 'OMN',
};

// ─── Country centroid coordinates ───
const COUNTRY_COORDS: Record<string, [number, number]> = {
  SGP: [103.8, 1.35], CHN: [104.2, 35.9], USA: [-95.7, 37.1],
  JPN: [138.3, 36.2], THA: [100.5, 15.9], KOR: [127.8, 35.9],
  IND: [78.9, 20.6], AUS: [133.8, -25.3], DEU: [10.4, 51.2],
  GBR: [-3.4, 55.4], TWN: [121.0, 23.5], HKG: [114.2, 22.3],
  PHL: [121.8, 12.9], VNM: [108.3, 14.1], IDN: [113.9, -0.8],
  FRA: [2.2, 46.2], ITA: [12.6, 41.9], NLD: [5.3, 52.1],
  BEL: [4.5, 50.5], ARE: [54.0, 23.4], SAU: [45.1, 23.9],
  BRA: [-51.9, -14.2], CAN: [-106.3, 56.1], MEX: [-102.6, 23.6],
  ESP: [-3.7, 40.4], CHE: [8.2, 46.8], NZL: [174.9, -40.9],
  TUR: [35.2, 38.9], RUS: [105.3, 61.5], POL: [19.1, 51.9],
  SWE: [18.6, 60.1], BGD: [90.4, 23.7], PAK: [69.3, 30.4],
  LKA: [80.8, 7.9], MMR: [96.0, 21.9], KHM: [105.0, 12.6],
  BRN: [114.7, 4.9], ZAF: [22.9, -30.6], NGA: [8.7, 9.1],
  EGY: [30.8, 26.8], KEN: [37.9, 0.0], GHA: [-1.0, 7.9],
  CHL: [-71.5, -35.7], ARG: [-63.6, -38.4], COL: [-74.3, 4.6],
  PER: [-75.0, -9.2], QAT: [51.2, 25.3], KWT: [47.5, 29.3],
  BHR: [50.6, 26.0], OMN: [55.9, 21.5], IRQ: [43.7, 33.2],
  IRN: [53.7, 32.4], ISR: [34.9, 31.0], JOR: [36.2, 30.6],
  DNK: [9.5, 56.3], NOR: [8.5, 60.5], FIN: [25.7, 61.9],
  PRT: [-8.2, 39.4], AUT: [14.6, 47.5], IRL: [-8.2, 53.4],
  CZE: [15.5, 49.8], HUN: [19.5, 47.2], ROU: [24.9, 45.9],
  GRC: [21.8, 39.1], ECU: [-78.2, -1.8], VEN: [-66.6, 6.4],
  URY: [-55.8, -32.5], BOL: [-65.0, -16.3], PRY: [-58.4, -23.4],
  CRI: [-84.0, 9.7], PAN: [-80.8, 8.5], GTM: [-90.2, 15.8],
  HND: [-86.2, 15.2], CUB: [-77.8, 21.5], JAM: [-77.3, 18.1],
  TTO: [-61.2, 10.4], HTI: [-72.3, 19.0],
  AFG: [67.7, 33.9], DZA: [1.7, 28.0], AGO: [17.9, -11.2],
  BGR: [25.5, 42.7], HRV: [15.2, 45.1], SVK: [19.7, 48.7],
  SVN: [14.6, 46.2], EST: [25.0, 58.6], LTU: [23.9, 55.2],
  LUX: [6.1, 49.8], ISL: [-19.0, 65.0], CYP: [33.4, 35.1],
  UKR: [31.2, 48.4], NPL: [84.1, 28.4], BTN: [90.4, 27.5],
  MNG: [103.8, 46.9], LAO: [102.5, 19.9], MAC: [113.5, 22.2],
  SYR: [38.0, 35.0], LBN: [35.9, 33.9], YEM: [48.5, 15.6],
  UZB: [64.6, 41.4], LBY: [17.2, 26.3], TUN: [9.5, 33.9],
  MAR: [-7.1, 31.8], SEN: [-14.5, 14.5], CMR: [12.4, 7.4],
  ETH: [40.5, 9.1], TZA: [34.9, -6.4], MOZ: [35.5, -18.7],
  UGA: [32.3, 1.4], COD: [21.8, -4.0], NAM: [18.5, -22.6],
  ZMB: [28.3, -13.1], ZWE: [29.2, -19.0], BFA: [-1.6, 12.3],
  MLI: [-8.0, 17.6], SYC: [55.5, -4.7], PNG: [143.9, -6.3],
  SUR: [-56.0, 4.0],
};

const COUNTRY_NAMES: Record<string, { bm: string; en: string }> = {
  SGP: { bm: 'Singapura', en: 'Singapore' }, CHN: { bm: 'China', en: 'China' },
  USA: { bm: 'Amerika Syarikat', en: 'United States' }, JPN: { bm: 'Jepun', en: 'Japan' },
  THA: { bm: 'Thailand', en: 'Thailand' }, KOR: { bm: 'Korea Selatan', en: 'South Korea' },
  IND: { bm: 'India', en: 'India' }, AUS: { bm: 'Australia', en: 'Australia' },
  DEU: { bm: 'Jerman', en: 'Germany' }, GBR: { bm: 'United Kingdom', en: 'United Kingdom' },
  TWN: { bm: 'Taiwan', en: 'Taiwan' }, HKG: { bm: 'Hong Kong', en: 'Hong Kong' },
  PHL: { bm: 'Filipina', en: 'Philippines' }, VNM: { bm: 'Vietnam', en: 'Vietnam' },
  IDN: { bm: 'Indonesia', en: 'Indonesia' }, FRA: { bm: 'Perancis', en: 'France' },
  ITA: { bm: 'Itali', en: 'Italy' }, NLD: { bm: 'Belanda', en: 'Netherlands' },
  BEL: { bm: 'Belgium', en: 'Belgium' }, ARE: { bm: 'Emiriah Arab Bersatu', en: 'UAE' },
  SAU: { bm: 'Arab Saudi', en: 'Saudi Arabia' }, BRA: { bm: 'Brazil', en: 'Brazil' },
  CAN: { bm: 'Kanada', en: 'Canada' }, MEX: { bm: 'Mexico', en: 'Mexico' },
  ESP: { bm: 'Sepanyol', en: 'Spain' }, CHE: { bm: 'Switzerland', en: 'Switzerland' },
  NZL: { bm: 'New Zealand', en: 'New Zealand' }, TUR: { bm: 'Turki', en: 'Turkey' },
  RUS: { bm: 'Rusia', en: 'Russia' }, POL: { bm: 'Poland', en: 'Poland' },
  SWE: { bm: 'Sweden', en: 'Sweden' }, BGD: { bm: 'Bangladesh', en: 'Bangladesh' },
  PAK: { bm: 'Pakistan', en: 'Pakistan' }, LKA: { bm: 'Sri Lanka', en: 'Sri Lanka' },
  MMR: { bm: 'Myanmar', en: 'Myanmar' }, KHM: { bm: 'Kemboja', en: 'Cambodia' },
  BRN: { bm: 'Brunei', en: 'Brunei' }, ZAF: { bm: 'Afrika Selatan', en: 'South Africa' },
  NGA: { bm: 'Nigeria', en: 'Nigeria' }, EGY: { bm: 'Mesir', en: 'Egypt' },
  KEN: { bm: 'Kenya', en: 'Kenya' }, GHA: { bm: 'Ghana', en: 'Ghana' },
  CHL: { bm: 'Chile', en: 'Chile' }, ARG: { bm: 'Argentina', en: 'Argentina' },
  COL: { bm: 'Colombia', en: 'Colombia' }, PER: { bm: 'Peru', en: 'Peru' },
  QAT: { bm: 'Qatar', en: 'Qatar' }, KWT: { bm: 'Kuwait', en: 'Kuwait' },
  BHR: { bm: 'Bahrain', en: 'Bahrain' }, OMN: { bm: 'Oman', en: 'Oman' },
  IRQ: { bm: 'Iraq', en: 'Iraq' }, IRN: { bm: 'Iran', en: 'Iran' },
  ISR: { bm: 'Israel', en: 'Israel' }, JOR: { bm: 'Jordan', en: 'Jordan' },
  DNK: { bm: 'Denmark', en: 'Denmark' }, NOR: { bm: 'Norway', en: 'Norway' },
  FIN: { bm: 'Finland', en: 'Finland' }, PRT: { bm: 'Portugal', en: 'Portugal' },
  AUT: { bm: 'Austria', en: 'Austria' }, IRL: { bm: 'Ireland', en: 'Ireland' },
  CZE: { bm: 'Czech Republic', en: 'Czech Republic' }, HUN: { bm: 'Hungary', en: 'Hungary' },
  ROU: { bm: 'Romania', en: 'Romania' }, GRC: { bm: 'Greece', en: 'Greece' },
};

const MALAYSIA_COORDS: [number, number] = [101.7, 3.1];
const DEFAULT_CENTER: [number, number] = [40, 5];
const DEFAULT_ZOOM = 1.6;

export interface DestData {
  value: number;
  code: string;
  topCommodity?: string;
  exportValue: number;
  importValue: number;
}

interface WorldMapProps {
  destinations: Record<string, DestData>;
  allCountries: { code: string; name: string }[];
}

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

type TradeViewMode = 'all' | 'export' | 'import';

export default function WorldMap({ destinations, allCountries }: WorldMapProps) {
  const { lang, t } = useLanguage();
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeView, setTradeView] = useState<TradeViewMode>('all');
  const [isDark, setIsDark] = useState(false);

  // Reactively detect dark mode
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const normalizedDest = useMemo(() => {
    const result: Record<string, DestData> = {};
    Object.entries(destinations).forEach(([code, data]) => {
      const alpha3 = ALPHA2_TO_ALPHA3[code] || code;
      if (!result[alpha3]) result[alpha3] = { value: 0, code: alpha3, topCommodity: data.topCommodity, exportValue: 0, importValue: 0 };
      result[alpha3].value += data.value;
      result[alpha3].exportValue += data.exportValue;
      result[alpha3].importValue += data.importValue;
      if (data.topCommodity && !result[alpha3].topCommodity) result[alpha3].topCommodity = data.topCommodity;
    });
    return result;
  }, [destinations]);

  const maxValue = useMemo(() => Math.max(...Object.values(normalizedDest).map(d => d.value), 1), [normalizedDest]);

  const topDest = useMemo(() => {
    return Object.entries(normalizedDest)
      .filter(([code]) => COUNTRY_COORDS[code])
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 25);
  }, [normalizedDest]);

  const countryList = useMemo(() => {
    const items = allCountries.map(c => {
      const alpha3 = ALPHA2_TO_ALPHA3[c.code] || c.code;
      return { code: alpha3, name: COUNTRY_NAMES[alpha3]?.[lang] || c.name || alpha3, value: normalizedDest[alpha3]?.value || 0 };
    });
    const seen = new Set<string>();
    return items
      .filter(c => { if (seen.has(c.code) || c.code === 'MYS') return false; seen.add(c.code); return true; })
      .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.value - a.value);
  }, [allCountries, lang, searchQuery, normalizedDest]);

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.5, 8));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.5, 1));
  const handleReset = useCallback(() => { setZoom(DEFAULT_ZOOM); setCenter(DEFAULT_CENTER); setSelectedCountry(''); }, []);

  const handleCountrySelect = useCallback((code: string) => {
    if (COUNTRY_COORDS[code]) {
      const coords = COUNTRY_COORDS[code];
      setCenter([(MALAYSIA_COORDS[0] + coords[0]) / 2, (MALAYSIA_COORDS[1] + coords[1]) / 2]);
      setZoom(3.5);
    }
    setSelectedCountry(code);
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  const getArcWidth = (value: number) => Math.max(0.8, (value / maxValue) * 5);

  const visibleDest = selectedCountry ? topDest.filter(([code]) => code === selectedCountry) : topDest;
  const dimmedDest = selectedCountry ? topDest.filter(([code]) => code !== selectedCountry) : [];
  const showExport = tradeView === 'all' || tradeView === 'export';
  const showImport = tradeView === 'all' || tradeView === 'import';

  // Theme colors
  const oceanColor = isDark ? '#0F172A' : '#0077B6';
  const landColor = isDark ? '#1E293B' : '#F8FAFC';
  const landStroke = isDark ? '#334155' : '#CBD5E1';
  const labelColor = isDark ? '#FFFFFF' : '#1E293B';

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border" style={{ aspectRatio: '21/9', minHeight: 380, background: isDark ? '#111827' : '#E0F2FE' }}>
      {/* ─── SVG Defs ─── */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="bmb-export-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={EXPORT_CYAN} />
            <stop offset="100%" stopColor={EXPORT_CYAN_END} />
          </linearGradient>
          <linearGradient id="bmb-import-grad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={IMPORT_MAGENTA} />
            <stop offset="100%" stopColor={IMPORT_MAGENTA_END} />
          </linearGradient>
          <filter id="bmb-glow-cyan">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="bmb-glow-magenta">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="bmb-hub-glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>

      {/* ─── Top-Left: Country Search ─── */}
      <div className="absolute top-3 left-3 z-20">
        <div className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-medium shadow-lg transition-colors"
            style={{
              background: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.9)',
              borderColor: isDark ? '#334155' : '#CBD5E1',
              color: labelColor,
            }}
          >
            <Search className="w-3.5 h-3.5" />
            {selectedCountry ? (COUNTRY_NAMES[selectedCountry]?.[lang] || selectedCountry) : t('searchCountry')}
          </button>
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 mt-1 w-64 rounded-lg shadow-2xl overflow-hidden z-30 border"
                style={{ background: isDark ? '#0F172A' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }}
              >
                <div className="p-2 border-b" style={{ borderColor: isDark ? '#1E293B' : '#F1F5F9' }}>
                  <input
                    type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('searchCountryPlaceholder')} autoFocus
                    className="w-full px-2 py-1 text-xs rounded outline-none"
                    style={{ background: isDark ? '#1E293B' : '#F8FAFC', color: labelColor }}
                  />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  <button onClick={() => { handleReset(); setSearchOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-[#06B6D4]/10"
                    style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                  >
                    {t('allCountries')}
                  </button>
                  {countryList.map(c => (
                    <button key={c.code} onClick={() => handleCountrySelect(c.code)}
                      className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between gap-2 transition-colors hover:bg-[#06B6D4]/10"
                      style={{
                        color: selectedCountry === c.code ? EXPORT_CYAN : labelColor,
                        fontWeight: selectedCountry === c.code ? 600 : 400,
                      }}
                    >
                      <span className="truncate">{c.name}</span>
                      {c.value > 0 && <span style={{ color: isDark ? '#64748B' : '#94A3B8' }}>{formatRM(c.value)}</span>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Top-Right: Zoom & Reset (Bilingual) ─── */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
        {[
          { action: handleZoomIn, icon: <ZoomIn className="w-4 h-4" />, tip: lang === 'bm' ? 'Zum Masuk' : 'Zoom In' },
          { action: handleZoomOut, icon: <ZoomOut className="w-4 h-4" />, tip: lang === 'bm' ? 'Zum Keluar' : 'Zoom Out' },
          { action: handleReset, icon: <RotateCcw className="w-3.5 h-3.5" />, tip: lang === 'bm' ? 'Set Semula' : 'Reset View' },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action} title={btn.tip}
            className="w-8 h-8 rounded-lg backdrop-blur-md border flex items-center justify-center shadow-lg transition-all hover:scale-105"
            style={{
              background: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.9)',
              borderColor: isDark ? '#334155' : '#CBD5E1',
              color: labelColor,
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* ─── Top-Center: Trade Type Toggle ─── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex gap-0.5 rounded-lg p-1 shadow-lg backdrop-blur-md border"
        style={{ background: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.92)', borderColor: isDark ? '#334155' : '#CBD5E1' }}
      >
        {([
          { key: 'all' as TradeViewMode, label: lang === 'bm' ? 'Semua' : 'All', color: '#8B5CF6' },
          { key: 'export' as TradeViewMode, label: lang === 'bm' ? 'Eksport' : 'Export', color: EXPORT_CYAN },
          { key: 'import' as TradeViewMode, label: lang === 'bm' ? 'Import' : 'Import', color: IMPORT_MAGENTA },
        ]).map(opt => (
          <button key={opt.key} onClick={() => setTradeView(opt.key)}
            className="px-3 py-1 rounded-md text-[10px] font-bold tracking-wide transition-all"
            style={{
              background: tradeView === opt.key ? opt.color : 'transparent',
              color: tradeView === opt.key ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
              boxShadow: tradeView === opt.key ? `0 0 12px ${opt.color}44` : 'none',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ─── Tooltip ─── */}
      <AnimatePresence>
        {hoveredCountry && normalizedDest[hoveredCountry] && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 rounded-xl shadow-2xl px-5 py-4 min-w-[280px] border"
            style={{
              background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.97)',
              borderColor: isDark ? '#334155' : '#E2E8F0',
              backdropFilter: 'blur(16px)',
            }}
          >
            <p className="text-sm font-bold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
              Malaysia → {COUNTRY_NAMES[hoveredCountry]?.[lang] || hoveredCountry}
            </p>
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: isDark ? '#CBD5E1' : '#475569' }}>
                  {lang === 'bm' ? 'Jumlah Dagangan' : 'Total Trade'}
                </span>
                <span className="text-sm font-bold" style={{ color: EXPORT_CYAN }}>{formatRM(normalizedDest[hoveredCountry].value)}</span>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: EXPORT_CYAN }} />
                  <span className="text-[10px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    {lang === 'bm' ? 'Eksport' : 'Export'}
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
                    {formatRM(normalizedDest[hoveredCountry].exportValue)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: IMPORT_MAGENTA }} />
                  <span className="text-[10px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    {lang === 'bm' ? 'Import' : 'Import'}
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
                    {formatRM(normalizedDest[hoveredCountry].importValue)}
                  </span>
                </div>
              </div>
              {normalizedDest[hoveredCountry].topCommodity && (
                <p className="text-[10px] pt-1 border-t" style={{ borderColor: isDark ? '#1E293B' : '#F1F5F9', color: isDark ? '#94A3B8' : '#64748B' }}>
                  {lang === 'bm' ? 'Barangan Utama' : 'Top Commodity'}:{' '}
                  <span className="font-semibold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>{normalizedDest[hoveredCountry].topCommodity}</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Legend ─── */}
      <div className="absolute bottom-3 right-3 z-10 rounded-lg border px-3 py-2 backdrop-blur-md"
        style={{ background: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.9)', borderColor: isDark ? '#334155' : '#CBD5E1' }}
      >
        <div className="flex items-center gap-4" style={{ fontSize: 10 }}>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-1 rounded-full" style={{ background: `linear-gradient(90deg, ${EXPORT_CYAN}, ${EXPORT_CYAN_END})`, boxShadow: `0 0 6px ${EXPORT_CYAN}66` }} />
            <span style={{ color: isDark ? '#FFFFFF' : '#475569', fontWeight: 600 }}>{lang === 'bm' ? 'Eksport' : 'Export'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-1 rounded-full" style={{ background: `linear-gradient(90deg, ${IMPORT_MAGENTA}, ${IMPORT_MAGENTA_END})`, boxShadow: `0 0 6px ${IMPORT_MAGENTA}66` }} />
            <span style={{ color: isDark ? '#FFFFFF' : '#475569', fontWeight: 600 }}>{lang === 'bm' ? 'Import' : 'Import'}</span>
          </div>
        </div>
      </div>

      {/* ─── Compass Rose (N/S/E/W) ─── */}
      <div className="absolute bottom-3 left-3 z-10" style={{ opacity: 0.55 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <circle cx="26" cy="26" r="24" stroke={isDark ? '#475569' : '#94A3B8'} strokeWidth="0.6" />
          <circle cx="26" cy="26" r="16" stroke={isDark ? '#334155' : '#CBD5E1'} strokeWidth="0.3" strokeDasharray="2 2" />
          <polygon points="26,4 23,21 29,21" fill={isDark ? '#FFFFFF' : '#1E293B'} opacity="0.8" />
          <polygon points="26,4 23,21 26,18" fill={isDark ? '#94A3B8' : '#64748B'} opacity="0.5" />
          <polygon points="26,48 23,31 29,31" fill={isDark ? '#475569' : '#94A3B8'} opacity="0.4" />
          <polygon points="48,26 31,23 31,29" fill={isDark ? '#475569' : '#94A3B8'} opacity="0.4" />
          <polygon points="4,26 21,23 21,29" fill={isDark ? '#475569' : '#94A3B8'} opacity="0.4" />
          <circle cx="26" cy="26" r="1.5" fill={isDark ? '#FFFFFF' : '#1E293B'} opacity="0.5" />
          <text x="26" y="2.5" textAnchor="middle" fill={isDark ? '#FFFFFF' : '#1E293B'} style={{ fontSize: '7px', fontWeight: 700, fontFamily: 'system-ui' }}>N</text>
          <text x="26" y="51.5" textAnchor="middle" fill={isDark ? '#94A3B8' : '#64748B'} style={{ fontSize: '6px', fontWeight: 600, fontFamily: 'system-ui' }}>S</text>
          <text x="51" y="27.5" textAnchor="middle" fill={isDark ? '#94A3B8' : '#64748B'} style={{ fontSize: '6px', fontWeight: 600, fontFamily: 'system-ui' }}>E</text>
          <text x="1" y="27.5" textAnchor="middle" fill={isDark ? '#94A3B8' : '#64748B'} style={{ fontSize: '6px', fontWeight: 600, fontFamily: 'system-ui' }}>W</text>
        </svg>
      </div>

      {/* ─── THE MAP ─── */}
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 148 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={zoom} center={center}
          onMoveEnd={({ coordinates, zoom: z }) => { setCenter(coordinates as [number, number]); setZoom(z); }}
          minZoom={1} maxZoom={8}
        >
          {/* Ocean */}
          <rect x={-1200} y={-700} width={3500} height={2000} fill={oceanColor} />

          {/* Graticule */}
          <Graticule stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.35)'} strokeWidth={0.3} strokeDasharray="4 4" />

          {/* Countries */}
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const geoId = geo.id || geo.properties?.iso_a3_eh;
                const alpha3 = NUM_TO_ALPHA3[String(geoId)];
                const isSelected = selectedCountry && alpha3 === selectedCountry;
                const isDimmed = selectedCountry && alpha3 !== selectedCountry && alpha3 !== 'MYS';
                const isMalaysia = alpha3 === 'MYS';

                let fill = landColor;
                if (isMalaysia) fill = EXPORT_CYAN;
                else if (isSelected) fill = isDark ? '#3B82F6' : '#2563EB';

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={isDark ? '#475569' : '#94A3B8'}
                    strokeWidth={0.4}
                    opacity={isDimmed ? 0.25 : 1}
                    onMouseEnter={() => { if (alpha3 && normalizedDest[alpha3]) setHoveredCountry(alpha3); }}
                    onMouseLeave={() => setHoveredCountry(null)}
                    style={{
                      default: { outline: 'none', transition: 'all 0.3s ease' },
                      hover: {
                        fill: alpha3 && normalizedDest[alpha3] ? (isDark ? '#0EA5E9' : '#0284C7') : fill,
                        outline: 'none',
                        cursor: alpha3 && normalizedDest[alpha3] ? 'pointer' : 'default',
                        strokeWidth: 0.6,
                      },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* ─── Dimmed ghost arcs ─── */}
          {dimmedDest.map(([code]) => (
            <Line key={`dim-${code}`} from={MALAYSIA_COORDS} to={COUNTRY_COORDS[code]}
              stroke={isDark ? '#1E293B' : '#CBD5E1'} strokeWidth={0.4} strokeOpacity={0.15} strokeLinecap="round" />
          ))}

          {/* ─── EXPORT arcs (Cyan, Malaysia → Country) ─── */}
          {showExport && visibleDest.filter(([, d]) => d.exportValue > 0).map(([code, data]) => (
            <React.Fragment key={`exp-${code}`}>
              {/* Glow layer */}
              <Line from={MALAYSIA_COORDS} to={COUNTRY_COORDS[code]}
                stroke={EXPORT_CYAN} strokeWidth={getArcWidth(data.exportValue) + 3}
                strokeOpacity={0.08} strokeLinecap="round" />
              {/* Main arc */}
              <Line from={MALAYSIA_COORDS} to={COUNTRY_COORDS[code]}
                stroke="url(#bmb-export-grad)" strokeWidth={getArcWidth(data.exportValue)}
                strokeOpacity={0.8} strokeLinecap="round" strokeDasharray="6 4"
              >
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.2s" repeatCount="indefinite" />
              </Line>
            </React.Fragment>
          ))}

          {/* ─── IMPORT arcs (Magenta, Country → Malaysia) ─── */}
          {showImport && visibleDest.filter(([, d]) => d.importValue > 0).map(([code, data]) => {
            const to = COUNTRY_COORDS[code];
            return (
              <React.Fragment key={`imp-${code}`}>
                <Line from={[to[0] + 0.8, to[1] - 0.5]} to={MALAYSIA_COORDS}
                  stroke={IMPORT_MAGENTA} strokeWidth={getArcWidth(data.importValue) + 3}
                  strokeOpacity={0.06} strokeLinecap="round" />
                <Line from={[to[0] + 0.8, to[1] - 0.5]} to={MALAYSIA_COORDS}
                  stroke="url(#bmb-import-grad)" strokeWidth={getArcWidth(data.importValue)}
                  strokeOpacity={0.75} strokeLinecap="round" strokeDasharray="4 5"
                >
                  <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.8s" repeatCount="indefinite" />
                </Line>
              </React.Fragment>
            );
          })}

          {/* ─── Destination pulse dots ─── */}
          {visibleDest.map(([code, data]) => {
            const hasExp = data.exportValue > 0 && showExport;
            const hasImp = data.importValue > 0 && showImport;
            const dotColor = hasExp && hasImp
              ? (data.exportValue >= data.importValue ? EXPORT_CYAN : IMPORT_MAGENTA)
              : hasExp ? EXPORT_CYAN : IMPORT_MAGENTA;
            return (
              <Marker key={`dot-${code}`} coordinates={COUNTRY_COORDS[code]}>
                <circle r={3.5 / zoom} fill={dotColor} opacity={0.9}>
                  <animate attributeName="r" values={`${3 / zoom};${7 / zoom};${3 / zoom}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r={2 / zoom} fill={dotColor} />
              </Marker>
            );
          })}

          {/* ─── Malaysia hub ─── */}
          <Marker coordinates={MALAYSIA_COORDS}>
            <circle r={22 / zoom} fill={EXPORT_CYAN} opacity={0.05} filter="url(#bmb-hub-glow)">
              <animate attributeName="r" values={`${22 / zoom};${30 / zoom};${22 / zoom}`} dur="4s" repeatCount="indefinite" />
            </circle>
            <circle r={12 / zoom} fill="none" stroke={EXPORT_CYAN} strokeWidth={1.2 / zoom} opacity={0.25}>
              <animate attributeName="r" values={`${12 / zoom};${18 / zoom};${12 / zoom}`} dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.25;0.05;0.25" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle r={5 / zoom} fill={EXPORT_CYAN} filter="url(#bmb-hub-glow)" opacity={0.9} />
            <text textAnchor="middle" y={-10 / zoom}
              style={{ fontSize: `${11 / zoom}px`, fontWeight: 800, fill: isDark ? '#FFFFFF' : '#0F172A', fontFamily: 'system-ui' }}
            >
              Malaysia
            </text>
          </Marker>

          {/* ─── Country labels ─── */}
          {visibleDest.map(([code]) => (
            <Marker key={`lbl-${code}`} coordinates={COUNTRY_COORDS[code]}
              onMouseEnter={() => setHoveredCountry(code)} onMouseLeave={() => setHoveredCountry(null)}
            >
              <text textAnchor="middle" y={-9 / zoom}
                style={{
                  fontSize: `${hoveredCountry === code ? 8.5 : 6.5}px`,
                  fill: isDark ? '#FFFFFF' : '#1E293B',
                  fontWeight: hoveredCountry === code ? 700 : 500,
                  opacity: hoveredCountry === code ? 1 : 0.75,
                  transition: 'all 0.2s',
                  pointerEvents: 'none',
                  fontFamily: 'system-ui',
                }}
              >
                {COUNTRY_NAMES[code]?.[lang]?.slice(0, 14) || code}
              </text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
