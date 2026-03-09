import React, { useMemo, useState, useCallback } from 'react';
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

// Trade type colors
const EXPORT_COLOR = 'hsl(180, 100%, 50%)';  // Neon Cyan
const IMPORT_COLOR = 'hsl(300, 85%, 60%)';   // Vibrant Magenta

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
  BRN: [114.7, 4.9], ZAF: [-22.9, -30.6], NGA: [8.7, 9.1],
  EGY: [30.8, 26.8], KEN: [37.9, -0.0], GHA: [-1.0, 7.9],
  CHL: [-71.5, -35.7], ARG: [-63.6, -38.4], COL: [-74.3, 4.6],
  PER: [-75.0, -9.2], QAT: [51.2, 25.3], KWT: [47.5, 29.3],
  BHR: [50.6, 26.0], OMN: [55.9, 21.5], IRQ: [43.7, 33.2],
  IRN: [53.7, 32.4], ISR: [34.9, 31.0], JOR: [36.2, 30.6],
  DNK: [9.5, 56.3], NOR: [8.5, 60.5], FIN: [25.7, 61.9],
  PRT: [-8.2, 39.4], AUT: [14.6, 47.5], IRL: [-8.2, 53.4],
  CZE: [15.5, 49.8], HUN: [19.5, 47.2], ROU: [24.9, 45.9],
  GRC: [21.8, 39.1],
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
};

const MALAYSIA_COORDS: [number, number] = [101.7, 3.1];
const DEFAULT_CENTER: [number, number] = [60, 10];
const DEFAULT_ZOOM = 1.5;

const NUM_TO_ALPHA3: Record<string, string> = {
  '702': 'SGP', '156': 'CHN', '840': 'USA', '392': 'JPN',
  '764': 'THA', '410': 'KOR', '356': 'IND', '036': 'AUS',
  '276': 'DEU', '826': 'GBR', '458': 'MYS', '158': 'TWN',
  '344': 'HKG', '608': 'PHL', '704': 'VNM', '360': 'IDN',
  '250': 'FRA', '380': 'ITA', '528': 'NLD', '056': 'BEL',
  '784': 'ARE', '682': 'SAU', '076': 'BRA', '124': 'CAN',
  '484': 'MEX',
};

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

export default function WorldMap({ destinations, allCountries }: WorldMapProps) {
  const { lang, t } = useLanguage();
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedDest = useMemo(() => {
    const result: Record<string, DestData> = {};
    Object.entries(destinations).forEach(([code, data]) => {
      const alpha3 = ALPHA2_TO_ALPHA3[code] || code;
      if (!result[alpha3]) result[alpha3] = { value: 0, code: alpha3, topCommodity: data.topCommodity, exportValue: 0, importValue: 0 };
      result[alpha3].value += data.value;
      result[alpha3].exportValue += data.exportValue;
      result[alpha3].importValue += data.importValue;
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
      .slice(0, 15);
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
    const unique = items.filter(c => {
      if (seen.has(c.code) || c.code === 'MYS') return false;
      seen.add(c.code);
      return true;
    });
    return unique
      .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.value - a.value);
  }, [allCountries, lang, searchQuery, normalizedDest]);

  const getCountryFill = (geoId: string) => {
    const alpha3 = NUM_TO_ALPHA3[geoId];
    if (alpha3 === 'MYS') return 'hsl(var(--primary))';
    if (alpha3 && normalizedDest[alpha3]) {
      const intensity = Math.max(0.25, normalizedDest[alpha3].value / maxValue);
      return `hsla(187, 72%, 42%, ${intensity})`;
    }
    return 'hsl(var(--muted))';
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
    setZoom(3);
    setSelectedCountry(code);
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  const getArcStrokeWidth = (value: number) => Math.max(1.2, (value / maxValue) * 5);

  const visibleDest = selectedCountry
    ? topDest.filter(([code]) => code === selectedCountry)
    : topDest;

  const dimmedDest = selectedCountry
    ? topDest.filter(([code]) => code !== selectedCountry)
    : [];

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-card" style={{ height: 520 }}>
      {/* SVG gradient defs for arcs */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="exportGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor={EXPORT_COLOR} />
          </linearGradient>
          <linearGradient id="importGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor={IMPORT_COLOR} />
          </linearGradient>
        </defs>
      </svg>

      {/* Controls overlay */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <div className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-xs font-medium text-foreground shadow-sm hover:bg-accent/10 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            {selectedCountry
              ? COUNTRY_NAMES[selectedCountry]?.[lang] || selectedCountry
              : t('searchCountry')}
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
                    placeholder={t('searchCountryPlaceholder')}
                    className="w-full px-2 py-1 text-xs bg-secondary/50 rounded border-none outline-none text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  <button
                    onClick={() => { handleReset(); setSearchOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent/10 transition-colors"
                  >
                    {t('allCountries')}
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

      {/* Zoom controls + Reset */}
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

      {/* Tooltip — dark mode: pure white text */}
      <AnimatePresence>
        {hoveredCountry && normalizedDest[hoveredCountry] && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg px-4 py-3 min-w-[230px]"
          >
            <p className="text-sm font-bold text-foreground dark:text-white">
              {COUNTRY_NAMES[hoveredCountry]?.[lang] || hoveredCountry}
            </p>
            <p className="text-xs text-muted-foreground dark:text-white/70 mt-1">
              {t('tradeValue')}: <span className="font-semibold text-primary">{formatRM(normalizedDest[hoveredCountry].value)}</span>
            </p>
            <div className="flex gap-3 mt-1">
              <p className="text-xs dark:text-white/70">
                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: EXPORT_COLOR }} />
                {lang === 'bm' ? 'Eksport' : 'Export'}: <span className="font-medium dark:text-white">{formatRM(normalizedDest[hoveredCountry].exportValue)}</span>
              </p>
              <p className="text-xs dark:text-white/70">
                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: IMPORT_COLOR }} />
                {lang === 'bm' ? 'Import' : 'Import'}: <span className="font-medium dark:text-white">{formatRM(normalizedDest[hoveredCountry].importValue)}</span>
              </p>
            </div>
            {normalizedDest[hoveredCountry].topCommodity && (
              <p className="text-xs text-muted-foreground dark:text-white/70 mt-1">
                {t('topCommodities')}: <span className="font-medium text-foreground dark:text-white">{normalizedDest[hoveredCountry].topCommodity}</span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend — Export/Import */}
      <div className="absolute bottom-3 right-3 z-10 bg-card/80 backdrop-blur-sm rounded-lg border border-border px-3 py-2">
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground dark:text-white/70">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: EXPORT_COLOR }} />
            <span>{lang === 'bm' ? 'Eksport' : 'Export'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: IMPORT_COLOR }} />
            <span>{lang === 'bm' ? 'Import' : 'Import'}</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 140 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={({ coordinates, zoom: z }) => { setCenter(coordinates as [number, number]); setZoom(z); }}
          minZoom={1}
          maxZoom={8}
        >
          {/* Ocean background */}
          <rect x={-1000} y={-600} width={3000} height={1800} className="fill-muted/10 dark:fill-[hsl(220,30%,8%)]" />

          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const geoId = geo.id || geo.properties?.iso_a3_eh;
                const alpha3 = NUM_TO_ALPHA3[String(geoId)];
                const isSelected = selectedCountry && alpha3 === selectedCountry;
                const isDimmed = selectedCountry && alpha3 !== selectedCountry && alpha3 !== 'MYS';
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isSelected ? 'hsl(var(--primary) / 0.6)' : getCountryFill(String(geoId))}
                    stroke="hsl(var(--border))"
                    strokeWidth={0.3}
                    opacity={isDimmed ? 0.35 : 1}
                    onMouseEnter={() => { if (alpha3 && normalizedDest[alpha3]) setHoveredCountry(alpha3); }}
                    onMouseLeave={() => setHoveredCountry(null)}
                    style={{
                      default: { outline: 'none', transition: 'opacity 0.3s' },
                      hover: { fill: alpha3 && normalizedDest[alpha3] ? 'hsl(187, 65%, 50%)' : 'hsl(var(--muted))', outline: 'none', cursor: alpha3 && normalizedDest[alpha3] ? 'pointer' : 'default' },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Dimmed arcs */}
          {dimmedDest.map(([code]) => (
            <Line
              key={`dim-${code}`}
              from={MALAYSIA_COORDS}
              to={COUNTRY_COORDS[code]}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={0.8}
              strokeOpacity={0.12}
              strokeLinecap="round"
            />
          ))}

          {/* Export arcs (cyan) */}
          {visibleDest.filter(([, d]) => d.exportValue > 0).map(([code, data]) => (
            <Line
              key={`export-${code}`}
              from={MALAYSIA_COORDS}
              to={COUNTRY_COORDS[code]}
              stroke={EXPORT_COLOR}
              strokeWidth={getArcStrokeWidth(data.exportValue)}
              strokeOpacity={0.65}
              strokeLinecap="round"
            />
          ))}

          {/* Import arcs (magenta) — slight offset */}
          {visibleDest.filter(([, d]) => d.importValue > 0).map(([code, data]) => {
            const coords = COUNTRY_COORDS[code];
            const offset: [number, number] = [coords[0] + 1.5, coords[1] - 1];
            return (
              <Line
                key={`import-${code}`}
                from={MALAYSIA_COORDS}
                to={offset}
                stroke={IMPORT_COLOR}
                strokeWidth={getArcStrokeWidth(data.importValue)}
                strokeOpacity={0.55}
                strokeLinecap="round"
              />
            );
          })}

          {/* Pulse dots at destinations */}
          {visibleDest.map(([code, data]) => {
            const dominant = data.exportValue >= data.importValue ? EXPORT_COLOR : IMPORT_COLOR;
            return (
              <Marker key={`pulse-${code}`} coordinates={COUNTRY_COORDS[code]}>
                <circle r={3 / zoom} fill={dominant} opacity={0.9}>
                  <animate attributeName="r" values={`${2.5 / zoom};${6 / zoom};${2.5 / zoom}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
                </circle>
              </Marker>
            );
          })}

          {/* Malaysia marker */}
          <Marker coordinates={MALAYSIA_COORDS}>
            <circle r={5 / zoom} fill="hsl(var(--primary))" />
            <circle r={10 / zoom} fill="hsl(var(--primary))" opacity={0.2}>
              <animate attributeName="r" values={`${10 / zoom};${15 / zoom};${10 / zoom}`} dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.05;0.2" dur="3s" repeatCount="indefinite" />
            </circle>
            <text textAnchor="middle" y={-10 / zoom} style={{ fontSize: `${10 / zoom}px`, fill: 'hsl(var(--foreground))', fontWeight: 700 }}>
              Malaysia
            </text>
          </Marker>

          {/* Country labels */}
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
                  fontSize: `${hoveredCountry === code ? 9 : 7.5}px`,
                  fill: hoveredCountry === code ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  fontWeight: hoveredCountry === code ? 600 : 400,
                  transition: 'all 0.2s',
                  pointerEvents: 'none',
                }}
              >
                {COUNTRY_NAMES[code]?.[lang]?.slice(0, 12) || code}
              </text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
