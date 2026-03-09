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
  BRN: [114.7, 4.9],
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

interface WorldMapProps {
  destinations: Record<string, { value: number; code: string; topCommodity?: string }>;
}

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

export default function WorldMap({ destinations }: WorldMapProps) {
  const { lang, t } = useLanguage();
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([80, 10]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize 2-letter codes to 3-letter
  const normalizedDest = useMemo(() => {
    const result: Record<string, { value: number; code: string; topCommodity?: string }> = {};
    Object.entries(destinations).forEach(([code, data]) => {
      const alpha3 = ALPHA2_TO_ALPHA3[code] || code;
      if (!result[alpha3]) result[alpha3] = { value: 0, code: alpha3, topCommodity: data.topCommodity };
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
      .slice(0, 12);
  }, [normalizedDest]);

  // Country list for dropdown
  const countryList = useMemo(() => {
    return topDest
      .map(([code, data]) => ({
        code,
        name: COUNTRY_NAMES[code]?.[lang] || code,
        value: data.value,
      }))
      .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [topDest, lang, searchQuery]);

  const getCountryFill = (geoId: string) => {
    const alpha3 = NUM_TO_ALPHA3[geoId];
    if (alpha3 === 'MYS') return 'hsl(var(--primary))';
    if (alpha3 && normalizedDest[alpha3]) {
      const intensity = Math.max(0.2, normalizedDest[alpha3].value / maxValue);
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
    if (!COUNTRY_COORDS[code]) return;
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

  // Arc line color based on value rank
  const getArcColor = (value: number) => {
    const ratio = value / maxValue;
    if (ratio > 0.6) return 'url(#arcGradientHigh)';
    if (ratio > 0.3) return 'url(#arcGradientMid)';
    return 'url(#arcGradientLow)';
  };

  const getArcStrokeWidth = (value: number) => {
    return Math.max(1, (value / maxValue) * 4);
  };

  const visibleDest = selectedCountry
    ? topDest.filter(([code]) => code === selectedCountry)
    : topDest;

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ height: 420 }}>
      {/* SVG gradient defs */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="arcGradientHigh" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(180, 80%, 50%)" />
            <stop offset="100%" stopColor="hsl(270, 70%, 60%)" />
          </linearGradient>
          <linearGradient id="arcGradientMid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(187, 72%, 50%)" />
            <stop offset="100%" stopColor="hsl(220, 60%, 55%)" />
          </linearGradient>
          <linearGradient id="arcGradientLow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(187, 50%, 55%)" />
            <stop offset="100%" stopColor="hsl(200, 40%, 60%)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Controls overlay */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        {/* Country search */}
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
                className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-30"
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
                <div className="max-h-48 overflow-y-auto">
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
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent/10 transition-colors flex items-center justify-between ${
                        selectedCountry === c.code ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-muted-foreground">{formatRM(c.value)}</span>
                    </button>
                  ))}
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
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg px-4 py-3 min-w-[200px]"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-10 bg-card/80 backdrop-blur-sm rounded-lg border border-border px-3 py-2">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-6 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(180,80%,50%), hsl(270,70%,60%))' }} />
            <span>{t('highValue')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(187,50%,55%), hsl(200,40%,60%))' }} />
            <span>{t('lowValue')}</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [0, 0] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={zoom} center={center} onMoveEnd={({ coordinates, zoom: z }) => { setCenter(coordinates as [number, number]); setZoom(z); }}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const geoId = geo.id || geo.properties?.iso_a3_eh;
                const alpha3 = NUM_TO_ALPHA3[String(geoId)];
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryFill(String(geoId))}
                    stroke="hsl(var(--border))"
                    strokeWidth={0.3}
                    onMouseEnter={() => { if (alpha3 && normalizedDest[alpha3]) setHoveredCountry(alpha3); }}
                    onMouseLeave={() => setHoveredCountry(null)}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: alpha3 && normalizedDest[alpha3] ? 'hsl(187, 65%, 50%)' : 'hsl(var(--muted))', outline: 'none', cursor: alpha3 && normalizedDest[alpha3] ? 'pointer' : 'default' },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Flow arcs */}
          {visibleDest.map(([code, data]) => (
            <React.Fragment key={`arc-${code}`}>
              <Line
                from={MALAYSIA_COORDS}
                to={COUNTRY_COORDS[code]}
                stroke={getArcColor(data.value)}
                strokeWidth={getArcStrokeWidth(data.value)}
                strokeOpacity={0.6}
                strokeLinecap="round"
                style={{
                  pointerEvents: 'visibleStroke',
                }}
              />
              {/* Pulse dot at destination */}
              <Marker coordinates={COUNTRY_COORDS[code]}>
                <circle r={2.5 / zoom} fill="hsl(270, 70%, 60%)" opacity={0.9}>
                  <animate attributeName="r" values={`${2 / zoom};${5 / zoom};${2 / zoom}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
                </circle>
              </Marker>
            </React.Fragment>
          ))}

          {/* Malaysia marker */}
          <Marker coordinates={MALAYSIA_COORDS}>
            <circle r={5 / zoom} fill="hsl(var(--primary))" />
            <circle r={10 / zoom} fill="hsl(var(--primary))" opacity={0.2}>
              <animate attributeName="r" values={`${10 / zoom};${15 / zoom};${10 / zoom}`} dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.05;0.2" dur="3s" repeatCount="indefinite" />
            </circle>
            <text textAnchor="middle" y={-10 / zoom} style={{ fontSize: `${10 / zoom}px`, fill: 'hsl(var(--foreground))', fontWeight: 700, fontFamily: 'Inter' }}>
              Malaysia
            </text>
          </Marker>

          {/* Country labels */}
          {visibleDest.map(([code, data]) => (
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
                  fontFamily: 'Inter',
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
