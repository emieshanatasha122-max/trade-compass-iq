import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
} from 'react-simple-maps';
import { ALPHA2_TO_ALPHA3 } from '@/data/tradeDataLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ─── Trade type arc colors ───
const EXPORT_GRADIENT = { start: '#00E676', end: '#2979FF' }; // Green → Blue
const IMPORT_GRADIENT = { start: '#FF9100', end: '#FF1744' }; // Orange → Red

// ─── Regional fill colors (subtle) ───
const REGION_FILLS: Record<string, { light: string; dark: string }> = {
  northAmerica: { light: 'hsla(210,55%,70%,0.30)', dark: 'hsla(210,55%,35%,0.35)' },
  southAmerica: { light: 'hsla(175,50%,60%,0.30)', dark: 'hsla(175,50%,30%,0.35)' },
  europe:       { light: 'hsla(0,45%,70%,0.25)',   dark: 'hsla(0,40%,35%,0.30)' },
  asia:         { light: 'hsla(40,55%,65%,0.30)',  dark: 'hsla(40,50%,35%,0.35)' },
  africa:       { light: 'hsla(140,45%,60%,0.30)', dark: 'hsla(140,40%,28%,0.35)' },
  oceania:      { light: 'hsla(270,45%,65%,0.30)', dark: 'hsla(270,40%,35%,0.35)' },
  malaysia:     { light: 'hsla(187,72%,42%,0.7)',  dark: 'hsla(187,72%,50%,0.7)' },
};

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

// Country → region mapping
const COUNTRY_REGION: Record<string, string> = {};
['USA','CAN','MEX','GTM','HND','CRI','PAN','CUB','JAM','HTI','TTO'].forEach(c => COUNTRY_REGION[c] = 'northAmerica');
['BRA','ARG','CHL','COL','PER','ECU','VEN','URY','BOL','PRY','SUR'].forEach(c => COUNTRY_REGION[c] = 'southAmerica');
['GBR','FRA','DEU','ITA','ESP','NLD','BEL','CHE','AUT','SWE','NOR','DNK','FIN','PRT','IRL','POL','CZE','HUN','ROU','GRC','BGR','HRV','SVK','SVN','EST','LTU','LUX','ISL','CYP','UKR'].forEach(c => COUNTRY_REGION[c] = 'europe');
['CHN','JPN','KOR','IND','IDN','THA','VNM','PHL','MYS','SGP','MMR','KHM','LAO','BRN','BGD','PAK','LKA','NPL','BTN','TWN','HKG','MAC','MNG','AFG','IRN','IRQ','ISR','JOR','KWT','LBN','QAT','SAU','ARE','BHR','OMN','SYR','TUR','UZB','YEM'].forEach(c => COUNTRY_REGION[c] = 'asia');
['ZAF','NGA','EGY','KEN','GHA','ETH','TZA','MOZ','SEN','CMR','DZA','MAR','TUN','LBY','AGO','COD','UGA','BFA','ZMB','ZWE','NAM','MLI','SYC'].forEach(c => COUNTRY_REGION[c] = 'africa');
['AUS','NZL','PNG'].forEach(c => COUNTRY_REGION[c] = 'oceania');

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
const DEFAULT_CENTER: [number, number] = [30, 5];
const DEFAULT_ZOOM = 1;

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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Observe dark mode changes
  useEffect(() => {
    const check = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
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

  const maxValue = useMemo(() => {
    const values = Object.values(normalizedDest).map(d => d.value);
    return Math.max(...values, 1);
  }, [normalizedDest]);

  const topDest = useMemo(() => {
    return Object.entries(normalizedDest)
      .filter(([code]) => COUNTRY_COORDS[code])
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 25);
  }, [normalizedDest]);

  const countryList = useMemo(() => {
    const items = allCountries.map(c => {
      const alpha3 = ALPHA2_TO_ALPHA3[c.code] || c.code;
      return {
        code: alpha3,
        name: COUNTRY_NAMES[alpha3]?.[lang] || c.name || alpha3,
        value: normalizedDest[alpha3]?.value || 0,
        hasCoords: !!COUNTRY_COORDS[alpha3],
      };
    });
    const seen = new Set<string>();
    return items
      .filter(c => {
        if (seen.has(c.code) || c.code === 'MYS') return false;
        seen.add(c.code);
        return true;
      })
      .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.value - a.value);
  }, [allCountries, lang, searchQuery, normalizedDest]);

  const getRegionFill = (alpha3: string): string => {
    if (alpha3 === 'MYS') return isDarkMode ? REGION_FILLS.malaysia.dark : REGION_FILLS.malaysia.light;
    const region = COUNTRY_REGION[alpha3];
    if (region && REGION_FILLS[region]) {
      return isDarkMode ? REGION_FILLS[region].dark : REGION_FILLS[region].light;
    }
    return isDarkMode ? 'hsla(220,15%,22%,0.5)' : 'hsla(220,15%,85%,0.4)';
  };

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.5, 8));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.5, 1));
  const handleReset = () => {
    setZoom(DEFAULT_ZOOM);
    setCenter(DEFAULT_CENTER);
    setSelectedCountry('');
  };

  const handleCountrySelect = useCallback((code: string) => {
    if (!COUNTRY_COORDS[code]) {
      setSelectedCountry(code);
      setSearchOpen(false);
      setSearchQuery('');
      return;
    }
    const coords = COUNTRY_COORDS[code];
    const mid: [number, number] = [
      (MALAYSIA_COORDS[0] + coords[0]) / 2,
      (MALAYSIA_COORDS[1] + coords[1]) / 2,
    ];
    setCenter(mid);
    setZoom(3.5);
    setSelectedCountry(code);
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  const getArcStrokeWidth = (value: number) => Math.max(0.8, (value / maxValue) * 5);

  const visibleDest = selectedCountry
    ? topDest.filter(([code]) => code === selectedCountry)
    : topDest;

  const dimmedDest = selectedCountry
    ? topDest.filter(([code]) => code !== selectedCountry)
    : [];

  const showExport = tradeView === 'all' || tradeView === 'export';
  const showImport = tradeView === 'all' || tradeView === 'import';

  // Styling
  const oceanFill = isDarkMode ? '#0B1F3B' : 'hsla(210,40%,95%,1)';
  const strokeColor = isDarkMode ? 'hsla(220,20%,30%,0.5)' : 'hsla(220,20%,70%,0.5)';
  const textFill = isDarkMode ? '#FFFFFF' : 'hsl(var(--foreground))';

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border" style={{ height: 500 }}>
      {/* CSS animations for arc pulse */}
      <style>{`
        @keyframes arcPulseExport {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -20; }
        }
        @keyframes arcPulseImport {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -16; }
        }
        @keyframes hubPulse {
          0%, 100% { r: 8; opacity: 0.25; }
          50% { r: 14; opacity: 0.08; }
        }
        .arc-export { animation: arcPulseExport 1.2s linear infinite; }
        .arc-import { animation: arcPulseImport 1.8s linear infinite; }
      `}</style>

      {/* SVG gradient defs */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="exportArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={EXPORT_GRADIENT.start} />
            <stop offset="100%" stopColor={EXPORT_GRADIENT.end} />
          </linearGradient>
          <linearGradient id="importArcGrad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={IMPORT_GRADIENT.start} />
            <stop offset="100%" stopColor={IMPORT_GRADIENT.end} />
          </linearGradient>
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="hubGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>

      {/* ─── Controls: Search ─── */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <div className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-xs font-medium text-foreground shadow-sm hover:bg-accent/10 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            {selectedCountry
              ? COUNTRY_NAMES[selectedCountry]?.[lang] || selectedCountry
              : (lang === 'bm' ? 'Cari Negara' : 'Search Country')}
          </button>
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-30"
              >
                <div className="p-2 border-b border-border">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={lang === 'bm' ? 'Taip nama negara...' : 'Type country name...'}
                    className="w-full px-2 py-1 text-xs bg-secondary/50 rounded border-none outline-none text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  <button
                    onClick={() => { handleReset(); setSearchOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent/10 transition-colors"
                  >
                    {lang === 'bm' ? '— Semua Negara —' : '— All Countries —'}
                  </button>
                  {countryList.map(c => (
                    <button
                      key={c.code}
                      onClick={() => handleCountrySelect(c.code)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent/10 transition-colors flex items-center justify-between gap-2 ${
                        selectedCountry === c.code ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      {c.value > 0 && <span className="text-muted-foreground shrink-0">{formatRM(c.value)}</span>}
                    </button>
                  ))}
                  {countryList.length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">{lang === 'bm' ? 'Tiada hasil' : 'No results'}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Controls: Zoom + Reset ─── */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
        <button onClick={handleZoomIn} className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-accent/10 transition-colors shadow-sm">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-accent/10 transition-colors shadow-sm">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleReset} className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-accent/10 transition-colors shadow-sm" title={lang === 'bm' ? 'Set Semula' : 'Reset View'}>
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── Trade Type Toggle ─── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-1 shadow-sm">
        {([
          { key: 'all' as TradeViewMode, label: lang === 'bm' ? 'Semua' : 'All' },
          { key: 'export' as TradeViewMode, label: lang === 'bm' ? 'Eksport' : 'Export' },
          { key: 'import' as TradeViewMode, label: lang === 'bm' ? 'Import' : 'Import' },
        ]).map(opt => (
          <button
            key={opt.key}
            onClick={() => setTradeView(opt.key)}
            className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${
              tradeView === opt.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ─── Tooltip ─── */}
      <AnimatePresence>
        {hoveredCountry && normalizedDest[hoveredCountry] && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl px-5 py-3.5 min-w-[280px]"
          >
            <p className="text-sm font-bold" style={{ color: textFill }}>
              Malaysia → {COUNTRY_NAMES[hoveredCountry]?.[lang] || hoveredCountry}
            </p>
            <div className="mt-2 space-y-1.5">
              <p className="text-xs" style={{ color: isDarkMode ? 'rgba(255,255,255,0.85)' : undefined }}>
                {lang === 'bm' ? 'Jumlah Dagangan' : 'Total Trade'}:{' '}
                <span className="font-bold text-primary">{formatRM(normalizedDest[hoveredCountry].value)}</span>
              </p>
              <div className="flex gap-4">
                <p className="text-xs" style={{ color: isDarkMode ? 'rgba(255,255,255,0.75)' : undefined }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ background: `linear-gradient(135deg, ${EXPORT_GRADIENT.start}, ${EXPORT_GRADIENT.end})` }} />
                  {lang === 'bm' ? 'Eksport' : 'Exports'}:{' '}
                  <span className="font-semibold" style={{ color: textFill }}>{formatRM(normalizedDest[hoveredCountry].exportValue)}</span>
                </p>
                <p className="text-xs" style={{ color: isDarkMode ? 'rgba(255,255,255,0.75)' : undefined }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ background: `linear-gradient(135deg, ${IMPORT_GRADIENT.start}, ${IMPORT_GRADIENT.end})` }} />
                  {lang === 'bm' ? 'Import' : 'Imports'}:{' '}
                  <span className="font-semibold" style={{ color: textFill }}>{formatRM(normalizedDest[hoveredCountry].importValue)}</span>
                </p>
              </div>
              {normalizedDest[hoveredCountry].topCommodity && (
                <p className="text-xs pt-0.5" style={{ color: isDarkMode ? 'rgba(255,255,255,0.75)' : undefined }}>
                  {lang === 'bm' ? 'Barangan Utama' : 'Top Commodity'}:{' '}
                  <span className="font-medium" style={{ color: textFill }}>{normalizedDest[hoveredCountry].topCommodity}</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Legend ─── */}
      <div className="absolute bottom-3 right-3 z-10 bg-card/85 backdrop-blur-sm rounded-lg border border-border px-3 py-2">
        <div className="flex items-center gap-4 text-[10px]" style={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : undefined }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${EXPORT_GRADIENT.start}, ${EXPORT_GRADIENT.end})` }} />
            <span>{lang === 'bm' ? 'Eksport' : 'Export'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${IMPORT_GRADIENT.start}, ${IMPORT_GRADIENT.end})` }} />
            <span>{lang === 'bm' ? 'Import' : 'Import'}</span>
          </div>
        </div>
      </div>

      {/* ─── Map ─── */}
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 148 }}
        style={{ width: '100%', height: '100%', minHeight: 480 }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={({ coordinates, zoom: z }) => { setCenter(coordinates as [number, number]); setZoom(z); }}
          minZoom={1}
          maxZoom={8}
        >
          {/* Ocean background */}
          <rect x={-1200} y={-700} width={3600} height={2000} fill={oceanFill} />

          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const geoId = geo.id || geo.properties?.iso_a3_eh;
                const alpha3 = NUM_TO_ALPHA3[String(geoId)];
                const isSelected = selectedCountry && alpha3 === selectedCountry;
                const isDimmed = selectedCountry && alpha3 !== selectedCountry && alpha3 !== 'MYS';
                const fill = isSelected
                  ? 'hsl(var(--primary) / 0.6)'
                  : alpha3 ? getRegionFill(alpha3) : (isDarkMode ? 'hsla(220,15%,22%,0.5)' : 'hsla(220,15%,85%,0.4)');
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth={0.4}
                    opacity={isDimmed ? 0.25 : 1}
                    onMouseEnter={() => { if (alpha3 && normalizedDest[alpha3]) setHoveredCountry(alpha3); }}
                    onMouseLeave={() => setHoveredCountry(null)}
                    style={{
                      default: { outline: 'none', transition: 'opacity 0.3s, fill 0.3s' },
                      hover: { fill: alpha3 && normalizedDest[alpha3] ? 'hsl(187, 65%, 50%)' : fill, outline: 'none', cursor: alpha3 && normalizedDest[alpha3] ? 'pointer' : 'default' },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* ─── Dimmed arcs ─── */}
          {dimmedDest.map(([code]) => (
            <Line
              key={`dim-${code}`}
              from={MALAYSIA_COORDS}
              to={COUNTRY_COORDS[code]}
              stroke={isDarkMode ? 'hsla(220,20%,50%,0.08)' : 'hsla(220,20%,60%,0.08)'}
              strokeWidth={0.5}
              strokeLinecap="round"
            />
          ))}

          {/* ─── Export arcs (Green → Blue) ─── */}
          {showExport && visibleDest.filter(([, d]) => d.exportValue > 0).map(([code, data]) => (
            <React.Fragment key={`export-${code}`}>
              {/* Glow */}
              <Line
                from={MALAYSIA_COORDS}
                to={COUNTRY_COORDS[code]}
                stroke={EXPORT_GRADIENT.start}
                strokeWidth={getArcStrokeWidth(data.exportValue) + 3}
                strokeOpacity={0.1}
                strokeLinecap="round"
                filter="url(#arcGlow)"
              />
              {/* Main arc */}
              <Line
                from={MALAYSIA_COORDS}
                to={COUNTRY_COORDS[code]}
                stroke="url(#exportArcGrad)"
                strokeWidth={getArcStrokeWidth(data.exportValue)}
                strokeOpacity={0.8}
                strokeLinecap="round"
                strokeDasharray="6 3"
                className="arc-export"
              />
            </React.Fragment>
          ))}

          {/* ─── Import arcs (Orange → Red) ─── */}
          {showImport && visibleDest.filter(([, d]) => d.importValue > 0).map(([code, data]) => {
            const coords = COUNTRY_COORDS[code];
            const offset: [number, number] = [coords[0] + 0.8, coords[1] - 0.5];
            return (
              <React.Fragment key={`import-${code}`}>
                {/* Glow */}
                <Line
                  from={offset}
                  to={MALAYSIA_COORDS}
                  stroke={IMPORT_GRADIENT.start}
                  strokeWidth={getArcStrokeWidth(data.importValue) + 3}
                  strokeOpacity={0.08}
                  strokeLinecap="round"
                  filter="url(#arcGlow)"
                />
                {/* Main arc */}
                <Line
                  from={offset}
                  to={MALAYSIA_COORDS}
                  stroke="url(#importArcGrad)"
                  strokeWidth={getArcStrokeWidth(data.importValue)}
                  strokeOpacity={0.7}
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                  className="arc-import"
                />
              </React.Fragment>
            );
          })}

          {/* ─── Destination pulse dots ─── */}
          {visibleDest.map(([code, data]) => {
            const hasExport = data.exportValue > 0 && showExport;
            const hasImport = data.importValue > 0 && showImport;
            const color = hasExport && hasImport
              ? (data.exportValue >= data.importValue ? EXPORT_GRADIENT.start : IMPORT_GRADIENT.start)
              : hasExport ? EXPORT_GRADIENT.start : IMPORT_GRADIENT.start;
            return (
              <Marker key={`pulse-${code}`} coordinates={COUNTRY_COORDS[code]}>
                <circle r={3 / zoom} fill={color} opacity={0.9}>
                  <animate attributeName="r" values={`${3 / zoom};${6 / zoom};${3 / zoom}`} dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.5s" repeatCount="indefinite" />
                </circle>
              </Marker>
            );
          })}

          {/* ─── Malaysia hub ─── */}
          <Marker coordinates={MALAYSIA_COORDS}>
            {/* Halo */}
            <circle r={20 / zoom} fill="hsl(var(--primary))" opacity={0.06} filter="url(#hubGlow)">
              <animate attributeName="r" values={`${18 / zoom};${28 / zoom};${18 / zoom}`} dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.06;0.02;0.06" dur="4s" repeatCount="indefinite" />
            </circle>
            {/* Pulse ring */}
            <circle r={10 / zoom} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5 / zoom} opacity={0.3}>
              <animate attributeName="r" values={`${10 / zoom};${18 / zoom};${10 / zoom}`} dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.05;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            {/* Core */}
            <circle r={5 / zoom} fill="hsl(var(--primary))" filter="url(#hubGlow)" />
            <text textAnchor="middle" y={-13 / zoom} style={{ fontSize: `${11 / zoom}px`, fontWeight: 800, fill: textFill }}>
              Malaysia
            </text>
          </Marker>

          {/* ─── Country labels ─── */}
          {visibleDest.map(([code]) => (
            <Marker
              key={`label-${code}`}
              coordinates={COUNTRY_COORDS[code]}
              onMouseEnter={() => setHoveredCountry(code)}
              onMouseLeave={() => setHoveredCountry(null)}
            >
              <text
                textAnchor="middle"
                y={-10 / zoom}
                style={{
                  fontSize: `${hoveredCountry === code ? 9 : 7}px`,
                  fill: textFill,
                  fontWeight: hoveredCountry === code ? 700 : 400,
                  opacity: hoveredCountry === code ? 1 : 0.8,
                  transition: 'all 0.2s',
                  pointerEvents: 'none',
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
