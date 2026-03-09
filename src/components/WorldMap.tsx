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

/* ── Region → color mapping ── */
const REGION_COLORS: Record<string, string> = {
  AFTA: 'hsl(175, 80%, 45%)',
  ASEAN: 'hsl(175, 80%, 45%)',
  EU: 'hsl(270, 65%, 58%)',
  NAFTA: 'hsl(30, 85%, 55%)',
  'ASIA TIMUR': 'hsl(210, 70%, 55%)',
  'ASIA BARAT': 'hsl(340, 70%, 55%)',
  'ASIA SELATAN': 'hsl(50, 75%, 50%)',
  OCEANIA: 'hsl(145, 60%, 45%)',
  AFRIKA: 'hsl(15, 75%, 50%)',
  'AMERIKA SELATAN': 'hsl(290, 55%, 55%)',
};
const DEFAULT_ARC_COLOR = 'hsl(325, 70%, 55%)'; // vibrant pink fallback

function getRegionColor(region?: string): string {
  if (!region) return DEFAULT_ARC_COLOR;
  const upper = region.toUpperCase();
  for (const [key, color] of Object.entries(REGION_COLORS)) {
    if (upper.includes(key)) return color;
  }
  return DEFAULT_ARC_COLOR;
}

/* ── Coordinates ── */
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

const NUM_TO_ALPHA3: Record<string, string> = {
  '702': 'SGP', '156': 'CHN', '840': 'USA', '392': 'JPN',
  '764': 'THA', '410': 'KOR', '356': 'IND', '036': 'AUS',
  '276': 'DEU', '826': 'GBR', '458': 'MYS', '158': 'TWN',
  '344': 'HKG', '608': 'PHL', '704': 'VNM', '360': 'IDN',
  '250': 'FRA', '380': 'ITA', '528': 'NLD', '056': 'BEL',
  '784': 'ARE', '682': 'SAU', '076': 'BRA', '124': 'CAN',
  '484': 'MEX',
};

interface DestData {
  value: number;
  code: string;
  topCommodity?: string;
  kawasanEkonomi?: string;
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
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([80, 10]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize 2-letter codes to 3-letter
  const normalizedDest = useMemo(() => {
    const result: Record<string, DestData> = {};
    Object.entries(destinations).forEach(([code, data]) => {
      const alpha3 = ALPHA2_TO_ALPHA3[code] || code;
      if (!result[alpha3]) result[alpha3] = { value: 0, code: alpha3, topCommodity: data.topCommodity, kawasanEkonomi: data.kawasanEkonomi };
      result[alpha3].value += data.value;
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

  // Full country list for dropdown — merge allCountries with map-able ones
  const countryList = useMemo(() => {
    // Start with all countries from data
    const items = allCountries.map(c => {
      const alpha3 = ALPHA2_TO_ALPHA3[c.code] || c.code;
      return {
        code: alpha3,
        name: COUNTRY_NAMES[alpha3]?.[lang] || c.name || alpha3,
        value: normalizedDest[alpha3]?.value || 0,
        hasCoords: !!COUNTRY_COORDS[alpha3],
      };
    });
    // Deduplicate by code
    const seen = new Set<string>();
    const unique = items.filter(c => {
      if (seen.has(c.code) || c.code === 'MYS') return false;
      seen.add(c.code);
      return true;
    });
    // Filter by search
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
    setZoom(1);
    setCenter([80, 10]);
    setSelectedCountry('');
  };

  const handleCountrySelect = useCallback((code: string) => {
    if (!COUNTRY_COORDS[code]) {
      // Country exists in data but no coords — just highlight in list
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

  // Region legend from visible destinations
  const regionLegend = useMemo(() => {
    const seen = new Map<string, string>();
    topDest.forEach(([_, data]) => {
      if (data.kawasanEkonomi && !seen.has(data.kawasanEkonomi)) {
        seen.set(data.kawasanEkonomi, getRegionColor(data.kawasanEkonomi));
      }
    });
    return Array.from(seen.entries()).slice(0, 5);
  }, [topDest]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-card" style={{ height: 450 }}>
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

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
        <button onClick={handleZoomIn} className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-accent/10 transition-colors shadow-sm">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-accent/10 transition-colors shadow-sm">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleReset} className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-accent/10 transition-colors shadow-sm">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredCountry && normalizedDest[hoveredCountry] && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg px-4 py-3 min-w-[220px]"
          >
            <p className="text-sm font-bold text-foreground">
              {COUNTRY_NAMES[hoveredCountry]?.[lang] || hoveredCountry}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('tradeValue')}: <span className="font-semibold text-primary">{formatRM(normalizedDest[hoveredCountry].value)}</span>
            </p>
            {normalizedDest[hoveredCountry].topCommodity && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('topCommodities')}: <span className="font-medium text-foreground">{normalizedDest[hoveredCountry].topCommodity}</span>
              </p>
            )}
            {normalizedDest[hoveredCountry].kawasanEkonomi && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {lang === 'bm' ? 'Kawasan' : 'Region'}: <span className="font-medium" style={{ color: getRegionColor(normalizedDest[hoveredCountry].kawasanEkonomi) }}>{normalizedDest[hoveredCountry].kawasanEkonomi}</span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Region legend */}
      <div className="absolute bottom-3 right-3 z-10 bg-card/80 backdrop-blur-sm rounded-lg border border-border px-3 py-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          {regionLegend.map(([name, color]) => (
            <div key={name} className="flex items-center gap-1">
              <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [0, 0] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={({ coordinates, zoom: z }) => { setCenter(coordinates as [number, number]); setZoom(z); }}
        >
          {/* Dark mode: darken ocean via rect */}
          <rect x={-1000} y={-500} width={3000} height={1500} fill="hsl(var(--muted) / 0.15)" />

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
                    opacity={isDimmed ? 0.4 : 1}
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

          {/* Dimmed arcs (when a country is selected) */}
          {dimmedDest.map(([code, data]) => (
            <Line
              key={`dim-${code}`}
              from={MALAYSIA_COORDS}
              to={COUNTRY_COORDS[code]}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              strokeOpacity={0.15}
              strokeLinecap="round"
            />
          ))}

          {/* Active flow arcs — colored by KAWASAN_EKONOMI */}
          {visibleDest.map(([code, data]) => {
            const regionColor = getRegionColor(data.kawasanEkonomi);
            return (
              <React.Fragment key={`arc-${code}`}>
                <Line
                  from={MALAYSIA_COORDS}
                  to={COUNTRY_COORDS[code]}
                  stroke={regionColor}
                  strokeWidth={getArcStrokeWidth(data.value)}
                  strokeOpacity={0.7}
                  strokeLinecap="round"
                />
                {/* Pulse dot at destination */}
                <Marker coordinates={COUNTRY_COORDS[code]}>
                  <circle r={3 / zoom} fill={regionColor} opacity={0.9}>
                    <animate attributeName="r" values={`${2.5 / zoom};${6 / zoom};${2.5 / zoom}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
                  </circle>
                </Marker>
              </React.Fragment>
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
