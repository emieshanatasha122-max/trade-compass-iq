import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TradeRecord } from '@/data/tradeDataLoader';
import SpaceBackground from './globe/SpaceBackground';
import GlobeControls from './globe/GlobeControls';
import CountryFilter from './globe/CountryFilter';
import TradeInfoCard from './globe/TradeInfoCard';
import CompassRose from './globe/CompassRose';

const MY_LAT = 4.2105;
const MY_LNG = 101.9758;
const MIN_ALTITUDE = 0.8;
const MAX_ALTITUDE = 3.5;
const TOP_N_ARCS = 10;

const COUNTRY_COORDS: Record<string, [number, number]> = {
  SG: [1.35, 103.82], CN: [35.86, 104.20], US: [37.09, -95.71], JP: [36.20, 138.25],
  TH: [15.87, 100.99], KR: [35.91, 127.77], IN: [20.59, 78.96], AU: [-25.27, 133.78],
  DE: [51.17, 10.45], GB: [55.38, -3.44], TW: [23.70, 120.96], HK: [22.40, 114.11],
  PH: [12.88, 121.77], VN: [14.06, 108.28], ID: [-0.79, 113.92], FR: [46.23, 2.21],
  IT: [41.87, 12.57], NL: [52.13, 5.29], ES: [40.46, -3.75], BE: [50.50, 4.47],
  CH: [46.82, 8.23], CA: [56.13, -106.35], MX: [23.63, -102.55], BR: [-14.24, -51.93],
  AE: [23.42, 53.85], SA: [23.89, 45.08], EG: [26.82, 30.80], ZA: [-30.56, 22.94],
  NG: [9.08, 8.68], BD: [23.68, 90.36], PK: [30.38, 69.35], LK: [7.87, 80.77],
  MM: [21.91, 95.96], KH: [12.57, 104.99], LA: [19.86, 102.50], BN: [4.54, 114.73],
  NZ: [-40.90, 174.89], TR: [38.96, 35.24], RU: [61.52, 105.32], PL: [51.92, 19.15],
  SE: [60.13, 18.64], NO: [60.47, 8.47], DK: [56.26, 9.50], FI: [61.92, 25.75],
  PT: [39.40, -8.22], AT: [47.52, 14.55], IE: [53.14, -7.69], CZ: [49.82, 15.47],
  HU: [47.16, 19.50], RO: [45.94, 24.97], GR: [39.07, 21.82], IL: [31.05, 34.85],
  JO: [30.59, 36.24], KW: [29.31, 47.48], QA: [25.35, 51.18], BH: [26.07, 50.56],
  OM: [21.47, 55.98], IQ: [33.22, 43.68], IR: [32.43, 53.69], CL: [-35.68, -71.54],
  AR: [-38.42, -63.62], CO: [4.57, -74.30], PE: [-9.19, -75.02], EC: [-1.83, -78.18],
  UY: [-32.52, -55.77], VE: [6.42, -66.59], KE: [-0.02, 37.91], GH: [7.95, -1.02],
  TZ: [-6.37, 34.89], ET: [9.15, 40.49], MZ: [-18.67, 35.53], SN: [14.50, -14.45],
  CM: [7.37, 12.35], SC: [-4.68, 55.49],
};

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

interface TradeArc {
  startLat: number; startLng: number;
  endLat: number; endLng: number;
  color: [string, string];
  value: number; stroke: number;
  countryCode: string; countryName: string;
  type: 'export' | 'import';
  topCommodity: string;
  exportValue: number; importValue: number; totalValue: number;
}

interface CountryAgg {
  exportValue: number; importValue: number;
  commodities: Record<string, number>;
  name: string;
}

interface Globe3DProps {
  data: TradeRecord[];
}

export default function Globe3D({ data }: Globe3DProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const { lang } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [hoveredArc, setHoveredArc] = useState<TradeArc | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tradeView, setTradeView] = useState<'all' | 'export' | 'import'>('all');
  const [basemap, setBasemap] = useState<'satellite' | 'map'>('satellite');
  const [globeReady, setGlobeReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 550 });
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [compassAngle, setCompassAngle] = useState(0);

  // Dark mode detection
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width, height: Math.min(Math.max(width * 0.6, 400), 650) });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Initial camera
  useEffect(() => {
    if (globeReady && globeRef.current) {
      globeRef.current.pointOfView({ lat: MY_LAT, lng: MY_LNG, altitude: 2.2 }, 1000);
      // Set zoom limits via three.js controls
      const controls = globeRef.current.controls() as any;
      if (controls) {
        controls.minDistance = 120;
        controls.maxDistance = 500;
      }
    }
  }, [globeReady]);

  // Track compass rotation from globe orientation
  useEffect(() => {
    if (!globeReady || !globeRef.current) return;
    let animId: number;
    const track = () => {
      if (globeRef.current) {
        const pov = globeRef.current.pointOfView();
        // Use longitude to approximate compass heading
        setCompassAngle(-pov.lng);
      }
      animId = requestAnimationFrame(track);
    };
    animId = requestAnimationFrame(track);
    return () => cancelAnimationFrame(animId);
  }, [globeReady]);

  // Aggregate data
  const countryData = useMemo(() => {
    const agg: Record<string, CountryAgg> = {};
    data.forEach(r => {
      const code = r.kodDestinasiEksportImport;
      if (!code || code === 'MY' || !COUNTRY_COORDS[code]) return;
      if (!agg[code]) agg[code] = { exportValue: 0, importValue: 0, commodities: {}, name: '' };
      if (r.jenisDagangan === 'Eksport') {
        agg[code].exportValue += r.jumlahDaganganRM;
        agg[code].name = r.destinasiEksport || code;
      } else {
        agg[code].importValue += r.jumlahDaganganRM;
        agg[code].name = r.negaraAsal || code;
      }
      agg[code].commodities[r.komoditiUtama] =
        (agg[code].commodities[r.komoditiUtama] || 0) + r.jumlahDaganganRM;
    });
    return agg;
  }, [data]);

  // Arcs — limited to top N countries by total trade value
  const arcs = useMemo(() => {
    const sorted = Object.entries(countryData)
      .map(([code, d]) => ({ code, total: d.exportValue + d.importValue }))
      .filter(x => COUNTRY_COORDS[x.code] && x.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, TOP_N_ARCS);

    const topCodes = new Set(sorted.map(x => x.code));
    // Also include selected country
    if (selectedCountry && countryData[selectedCountry]) topCodes.add(selectedCountry);

    let maxVal = 0;
    const arcList: TradeArc[] = [];

    topCodes.forEach(code => {
      const d = countryData[code];
      const coords = COUNTRY_COORDS[code];
      if (!d || !coords) return;
      const total = d.exportValue + d.importValue;
      if (total > maxVal) maxVal = total;
      const topComm = Object.entries(d.commodities).sort((a, b) => b[1] - a[1])[0];

      if (d.exportValue > 0 && (tradeView === 'all' || tradeView === 'export')) {
        arcList.push({
          startLat: MY_LAT, startLng: MY_LNG,
          endLat: coords[0], endLng: coords[1],
          color: ['#10B981', '#06D6A0'], value: d.exportValue, stroke: 0.5,
          countryCode: code, countryName: d.name || code, type: 'export',
          topCommodity: topComm?.[0] || '-',
          exportValue: d.exportValue, importValue: d.importValue, totalValue: total,
        });
      }
      if (d.importValue > 0 && (tradeView === 'all' || tradeView === 'import')) {
        arcList.push({
          startLat: coords[0], startLng: coords[1],
          endLat: MY_LAT, endLng: MY_LNG,
          color: ['#EF4444', '#F97316'], value: d.importValue, stroke: 0.5,
          countryCode: code, countryName: d.name || code, type: 'import',
          topCommodity: topComm?.[0] || '-',
          exportValue: d.exportValue, importValue: d.importValue, totalValue: total,
        });
      }
    });

    arcList.forEach(a => { a.stroke = Math.max(0.4, (a.value / (maxVal || 1)) * 4.5); });
    return arcList;
  }, [countryData, tradeView, selectedCountry]);

  // Points for all countries with trade data
  const points = useMemo(() => {
    return Object.entries(countryData)
      .filter(([code]) => COUNTRY_COORDS[code])
      .map(([code, d]) => ({
        lat: COUNTRY_COORDS[code][0],
        lng: COUNTRY_COORDS[code][1],
        code,
        name: d.name || code,
        value: d.exportValue + d.importValue,
        color: selectedCountry === code
          ? '#F59E0B'
          : isDark ? '#06B6D4' : '#3B82F6',
        size: selectedCountry === code ? 0.7 : 0.3,
      }));
  }, [countryData, isDark, selectedCountry]);

  // Malaysia pulsing ring
  const malaysiaRing = useMemo(() => [{
    lat: MY_LAT, lng: MY_LNG,
    maxR: 5, propagationSpeed: 2, repeatPeriod: 1200,
    color: isDark ? 'rgba(6, 182, 212, 0.6)' : 'rgba(14, 165, 233, 0.6)',
  }], [isDark]);

  // Country list for filter
  const countryList = useMemo(() => {
    return Object.entries(countryData)
      .filter(([code]) => COUNTRY_COORDS[code])
      .map(([code, d]) => ({ code, name: d.name || code }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [countryData]);

  // Selected country info
  const selectedInfo = useMemo(() => {
    if (!selectedCountry || !countryData[selectedCountry]) return null;
    const d = countryData[selectedCountry];
    const topComm = Object.entries(d.commodities).sort((a, b) => b[1] - a[1])[0];
    return {
      name: d.name || selectedCountry,
      totalValue: d.exportValue + d.importValue,
      exportValue: d.exportValue,
      importValue: d.importValue,
      topCommodity: topComm?.[0] || '-',
    };
  }, [selectedCountry, countryData]);

  // Country selection with smooth 2.5s camera animation
  const handleCountrySelect = useCallback((code: string | null) => {
    setSelectedCountry(code);
    if (code && COUNTRY_COORDS[code] && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: COUNTRY_COORDS[code][0], lng: COUNTRY_COORDS[code][1], altitude: 1.5 },
        2500
      );
    }
  }, []);

  const handlePointClick = useCallback((point: object) => {
    const p = point as { code: string };
    handleCountrySelect(p.code);
  }, [handleCountrySelect]);

  const handleArcHover = useCallback((arc: object | null, _prev: object | null, event?: MouseEvent) => {
    setHoveredArc(arc as TradeArc | null);
    if (event) setTooltipPos({ x: event.clientX, y: event.clientY });
  }, []);

  const handleZoomIn = useCallback(() => {
    if (!globeRef.current) return;
    const pov = globeRef.current.pointOfView();
    globeRef.current.pointOfView({ ...pov, altitude: Math.max(MIN_ALTITUDE, pov.altitude - 0.4) }, 400);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!globeRef.current) return;
    const pov = globeRef.current.pointOfView();
    globeRef.current.pointOfView({ ...pov, altitude: Math.min(MAX_ALTITUDE, pov.altitude + 0.4) }, 400);
  }, []);

  // Globe textures
  const globeImageUrl = basemap === 'satellite'
    ? (isDark
        ? '//unpkg.com/three-globe/example/img/earth-night.jpg'
        : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    : (isDark
        ? '//unpkg.com/three-globe/example/img/earth-topology.png'
        : '//unpkg.com/three-globe/example/img/earth-day.jpg');

  const atmosphereColor = isDark ? '#06B6D4' : '#87CEEB';

  return (
    <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden border border-border">
      <SpaceBackground isDark={isDark} />

      {/* Top bar: Country search + Trade filter */}
      <div className="absolute top-3 left-3 right-14 z-20 flex items-center gap-2 flex-wrap">
        <CountryFilter
          countries={countryList}
          selected={selectedCountry}
          onSelect={handleCountrySelect}
          lang={lang}
        />
        <div className="flex items-center gap-1">
          {(['all', 'export', 'import'] as const).map(v => (
            <button
              key={v}
              onClick={() => setTradeView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                tradeView === v
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {v === 'all' ? (lang === 'bm' ? 'Semua' : 'All')
                : v === 'export' ? (lang === 'bm' ? 'Eksport' : 'Export')
                : (lang === 'bm' ? 'Import' : 'Import')}
            </button>
          ))}
        </div>
      </div>

      {/* Basemap switcher — top right */}
      <GlobeControls
        lang={lang}
        basemap={basemap}
        onBasemapChange={setBasemap}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Compass — bottom left */}
      <CompassRose angle={compassAngle} />

      {/* Info card — right side only */}
      {selectedInfo && (
        <TradeInfoCard
          countryName={selectedInfo.name}
          totalValue={selectedInfo.totalValue}
          exportValue={selectedInfo.exportValue}
          importValue={selectedInfo.importValue}
          topCommodity={selectedInfo.topCommodity}
          onClose={() => setSelectedCountry(null)}
          lang={lang}
        />
      )}

      {/* Legend — bottom right */}
      <div className="absolute bottom-3 right-3 z-20 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2.5 text-[10px]">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-3 h-0.5 rounded bg-[#10B981]" />
          <span className="text-muted-foreground">{lang === 'bm' ? 'Eksport' : 'Export'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded bg-[#EF4444]" />
          <span className="text-muted-foreground">{lang === 'bm' ? 'Import' : 'Import'}</span>
        </div>
        <div className="mt-1 pt-1 border-t border-border text-muted-foreground">
          Top {TOP_N_ARCS} {lang === 'bm' ? 'rakan dagang' : 'partners'}
        </div>
      </div>

      {/* Globe */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={globeImageUrl}
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor={atmosphereColor}
          atmosphereAltitude={0.25}
          onGlobeReady={() => setGlobeReady(true)}

          arcsData={arcs}
          arcStartLat="startLat" arcStartLng="startLng"
          arcEndLat="endLat" arcEndLng="endLng"
          arcColor="color" arcStroke="stroke"
          arcDashLength={0.5} arcDashGap={0.25}
          arcDashAnimateTime={1800}
          arcAltitudeAutoScale={0.45}
          onArcHover={handleArcHover as any}

          pointsData={points}
          pointLat="lat" pointLng="lng"
          pointColor="color" pointAltitude={0.01}
          pointRadius="size" pointsMerge={false}
          onPointClick={handlePointClick as any}

          ringsData={malaysiaRing}
          ringLat="lat" ringLng="lng"
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
          ringColor="color"

          labelsData={points.filter(p => p.value > 0).slice(0, 20)}
          labelLat="lat" labelLng="lng" labelText="name"
          labelSize={0.5} labelDotRadius={0.12}
          labelColor={() => isDark ? '#E2E8F0' : '#1E293B'}
          labelResolution={2} labelAltitude={0.015}
        />
      </div>

      {/* Arc tooltip */}
      {hoveredArc && (
        <div
          className="fixed z-50 pointer-events-none bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-xl p-3 text-xs max-w-xs"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}
        >
          <p className="font-bold text-foreground mb-1.5">
            {hoveredArc.type === 'export'
              ? `Malaysia → ${hoveredArc.countryName}`
              : `${hoveredArc.countryName} → Malaysia`}
          </p>
          <div className="space-y-1 text-muted-foreground">
            <p>{lang === 'bm' ? 'Jumlah Dagangan' : 'Total Trade'}: <span className="font-semibold text-foreground">{formatRM(hoveredArc.totalValue)}</span></p>
            <p>{lang === 'bm' ? 'Eksport' : 'Export'}: <span className="text-[#10B981] font-semibold">{formatRM(hoveredArc.exportValue)}</span></p>
            <p>{lang === 'bm' ? 'Import' : 'Import'}: <span className="text-[#EF4444] font-semibold">{formatRM(hoveredArc.importValue)}</span></p>
            <p>{lang === 'bm' ? 'Barangan Utama' : 'Top Commodity'}: <span className="text-foreground">{hoveredArc.topCommodity}</span></p>
          </div>
        </div>
      )}

      {/* Loading */}
      {!globeReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-40">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">{lang === 'bm' ? 'Memuatkan glob...' : 'Loading globe...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
