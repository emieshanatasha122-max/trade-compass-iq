import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TradeRecord } from '@/data/tradeDataLoader';
import { Compass } from 'lucide-react';

// Malaysia coordinates
const MY_LAT = 4.2105;
const MY_LNG = 101.9758;

// Country coordinates (lat, lng) keyed by ISO alpha-2
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

// Region colors for countries
const REGION_MAP: Record<string, string> = {
  SG: 'asia', CN: 'asia', JP: 'asia', KR: 'asia', IN: 'asia', TW: 'asia', HK: 'asia',
  PH: 'asia', VN: 'asia', ID: 'asia', TH: 'asia', BD: 'asia', PK: 'asia', LK: 'asia',
  MM: 'asia', KH: 'asia', LA: 'asia', BN: 'asia', AE: 'asia', SA: 'asia', IL: 'asia',
  JO: 'asia', KW: 'asia', QA: 'asia', BH: 'asia', OM: 'asia', IQ: 'asia', IR: 'asia', TR: 'asia',
  US: 'namerica', CA: 'namerica', MX: 'namerica',
  BR: 'samerica', AR: 'samerica', CO: 'samerica', CL: 'samerica', PE: 'samerica',
  EC: 'samerica', UY: 'samerica', VE: 'samerica',
  DE: 'europe', GB: 'europe', FR: 'europe', IT: 'europe', NL: 'europe', ES: 'europe',
  BE: 'europe', CH: 'europe', PL: 'europe', SE: 'europe', NO: 'europe', DK: 'europe',
  FI: 'europe', PT: 'europe', AT: 'europe', IE: 'europe', CZ: 'europe', HU: 'europe',
  RO: 'europe', GR: 'europe', RU: 'europe',
  AU: 'oceania', NZ: 'oceania',
  EG: 'africa', ZA: 'africa', NG: 'africa', KE: 'africa', GH: 'africa', TZ: 'africa',
  ET: 'africa', MZ: 'africa', SN: 'africa', CM: 'africa', SC: 'africa',
};

const LIGHT_REGION_COLORS: Record<string, string> = {
  asia: '#F59E0B', europe: '#EF4444', africa: '#22C55E',
  namerica: '#3B82F6', samerica: '#14B8A6', oceania: '#A855F7',
};

const DARK_REGION_COLORS: Record<string, string> = {
  asia: '#78716C', europe: '#78716C', africa: '#78716C',
  namerica: '#78716C', samerica: '#78716C', oceania: '#78716C',
};

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

interface TradeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: [string, string];
  value: number;
  stroke: number;
  countryCode: string;
  countryName: string;
  type: 'export' | 'import';
  topCommodity: string;
  exportValue: number;
  importValue: number;
  totalValue: number;
}

interface TradePoint {
  lat: number;
  lng: number;
  code: string;
  name: string;
  value: number;
  color: string;
}

interface Globe3DProps {
  data: TradeRecord[];
}

export default function Globe3D({ data }: Globe3DProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [hoveredArc, setHoveredArc] = useState<TradeArc | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tradeView, setTradeView] = useState<'all' | 'export' | 'import'>('all');
  const [globeReady, setGlobeReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Detect dark mode
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
        setDimensions({ width, height: Math.min(width * 0.65, 600) });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Set initial view to Malaysia
  useEffect(() => {
    if (globeReady && globeRef.current) {
      globeRef.current.pointOfView({ lat: MY_LAT, lng: MY_LNG, altitude: 2.2 }, 1000);
    }
  }, [globeReady]);

  // Aggregate trade data by country
  const { arcs, points, maxValue } = useMemo(() => {
    const countryData: Record<string, {
      exportValue: number; importValue: number;
      commodities: Record<string, number>;
      name: string;
    }> = {};

    data.forEach(r => {
      const code = r.kodDestinasiEksportImport;
      if (!code || code === 'MY' || !COUNTRY_COORDS[code]) return;

      if (!countryData[code]) {
        countryData[code] = { exportValue: 0, importValue: 0, commodities: {}, name: '' };
      }
      if (r.jenisDagangan === 'Eksport') {
        countryData[code].exportValue += r.jumlahDaganganRM;
        countryData[code].name = r.destinasiEksport || code;
      } else {
        countryData[code].importValue += r.jumlahDaganganRM;
        countryData[code].name = r.negaraAsal || code;
      }
      countryData[code].commodities[r.komoditiUtama] =
        (countryData[code].commodities[r.komoditiUtama] || 0) + r.jumlahDaganganRM;
    });

    let maxVal = 0;
    const arcList: TradeArc[] = [];
    const pointList: TradePoint[] = [];

    Object.entries(countryData).forEach(([code, d]) => {
      const coords = COUNTRY_COORDS[code];
      if (!coords) return;

      const total = d.exportValue + d.importValue;
      if (total <= 0) return;
      if (total > maxVal) maxVal = total;

      const topComm = Object.entries(d.commodities).sort((a, b) => b[1] - a[1])[0];

      pointList.push({
        lat: coords[0], lng: coords[1], code, name: d.name || code,
        value: total, color: isDark ? '#06B6D4' : LIGHT_REGION_COLORS[REGION_MAP[code] || 'asia'] || '#888',
      });

      if (d.exportValue > 0 && (tradeView === 'all' || tradeView === 'export')) {
        arcList.push({
          startLat: MY_LAT, startLng: MY_LNG,
          endLat: coords[0], endLng: coords[1],
          color: ['#10B981', '#059669'],
          value: d.exportValue,
          stroke: 0.5,
          countryCode: code, countryName: d.name || code,
          type: 'export',
          topCommodity: topComm ? topComm[0] : '-',
          exportValue: d.exportValue, importValue: d.importValue, totalValue: total,
        });
      }

      if (d.importValue > 0 && (tradeView === 'all' || tradeView === 'import')) {
        arcList.push({
          startLat: coords[0], startLng: coords[1],
          endLat: MY_LAT, endLng: MY_LNG,
          color: ['#EF4444', '#DC2626'],
          value: d.importValue,
          stroke: 0.5,
          countryCode: code, countryName: d.name || code,
          type: 'import',
          topCommodity: topComm ? topComm[0] : '-',
          exportValue: d.exportValue, importValue: d.importValue, totalValue: total,
        });
      }
    });

    // Normalize stroke widths
    arcList.forEach(a => {
      a.stroke = Math.max(0.3, (a.value / (maxVal || 1)) * 4);
    });

    return { arcs: arcList, points: pointList, maxValue: maxVal };
  }, [data, isDark, tradeView]);

  // Malaysia highlight point
  const malaysiaPoint = useMemo(() => [{
    lat: MY_LAT, lng: MY_LNG, code: 'MY', name: 'Malaysia',
    value: 1, color: isDark ? '#06B6D4' : '#0EA5E9', size: 0.8,
  }], [isDark]);

  // Malaysia ring
  const malaysiaRing = useMemo(() => [{
    lat: MY_LAT, lng: MY_LNG,
    maxR: 5, propagationSpeed: 2, repeatPeriod: 1200,
    color: isDark ? 'rgba(6, 182, 212, 0.6)' : 'rgba(14, 165, 233, 0.6)',
  }], [isDark]);

  const handleArcHover = useCallback((arc: object | null, _prev: object | null, event?: MouseEvent) => {
    setHoveredArc(arc as TradeArc | null);
    if (event) setTooltipPos({ x: event.clientX, y: event.clientY });
  }, []);

  const handlePointClick = useCallback((point: object) => {
    const p = point as TradePoint;
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.5 }, 800);
    }
  }, []);

  const globeImageUrl = isDark
    ? '//unpkg.com/three-globe/example/img/earth-night.jpg'
    : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

  const atmosphereColor = isDark ? '#06B6D4' : '#87CEEB';

  return (
    <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden border border-border bg-card">
      {/* Controls */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        {(['all', 'export', 'import'] as const).map(v => (
          <button
            key={v}
            onClick={() => setTradeView(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tradeView === v
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {v === 'all' ? (lang === 'bm' ? 'Semua' : 'All')
              : v === 'export' ? (lang === 'bm' ? 'Eksport' : 'Export')
              : (lang === 'bm' ? 'Import' : 'Import')}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-3 z-20 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2.5 text-[10px]">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-3 h-0.5 rounded bg-[#10B981]" />
          <span className="text-muted-foreground">{lang === 'bm' ? 'Eksport' : 'Export'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded bg-[#EF4444]" />
          <span className="text-muted-foreground">{lang === 'bm' ? 'Import' : 'Import'}</span>
        </div>
      </div>

      {/* Compass */}
      <div className="absolute bottom-3 left-3 z-20 bg-card/90 backdrop-blur-sm border border-border rounded-full w-16 h-16 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          <Compass className="w-8 h-8 text-primary" />
          <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[7px] font-bold text-foreground">N</span>
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] font-bold text-foreground">S</span>
          <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[7px] font-bold text-foreground">E</span>
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[7px] font-bold text-foreground">W</span>
        </div>
      </div>

      {/* Globe */}
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl={globeImageUrl}
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor={atmosphereColor}
        atmosphereAltitude={0.2}
        onGlobeReady={() => setGlobeReady(true)}

        // Arcs
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcStroke="stroke"
        arcDashLength={0.6}
        arcDashGap={0.3}
        arcDashAnimateTime={2000}
        arcAltitudeAutoScale={0.4}
        onArcHover={handleArcHover as any}

        // Points (trade partners)
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.01}
        pointRadius={0.3}
        pointsMerge={false}
        onPointClick={handlePointClick as any}

        // Malaysia highlight ring
        ringsData={malaysiaRing}
        ringLat="lat"
        ringLng="lng"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringColor="color"

        // Labels for trade points
        labelsData={points.slice(0, 15)}
        labelLat="lat"
        labelLng="lng"
        labelText="name"
        labelSize={0.6}
        labelDotRadius={0.15}
        labelColor={() => isDark ? '#E2E8F0' : '#1E293B'}
        labelResolution={2}
        labelAltitude={0.015}
      />

      {/* Tooltip */}
      {hoveredArc && (
        <div
          className="fixed z-50 pointer-events-none bg-card border border-border rounded-lg shadow-lg p-3 text-xs max-w-xs"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}
        >
          <p className="font-bold text-foreground mb-1.5">
            {hoveredArc.type === 'export' ? 'Malaysia → ' : `${hoveredArc.countryName} → Malaysia`}
            {hoveredArc.type === 'export' ? hoveredArc.countryName : ''}
          </p>
          <div className="space-y-1 text-muted-foreground">
            <p>{lang === 'bm' ? 'Jumlah Dagangan' : 'Total Trade'}: <span className="font-semibold text-foreground">{formatRM(hoveredArc.totalValue)}</span></p>
            <p>{lang === 'bm' ? 'Eksport' : 'Export'}: <span className="text-[#10B981] font-semibold">{formatRM(hoveredArc.exportValue)}</span></p>
            <p>{lang === 'bm' ? 'Import' : 'Import'}: <span className="text-[#EF4444] font-semibold">{formatRM(hoveredArc.importValue)}</span></p>
            <p>{lang === 'bm' ? 'Barangan Utama' : 'Top Commodity'}: <span className="text-foreground">{hoveredArc.topCommodity}</span></p>
          </div>
        </div>
      )}

      {/* Interaction hint */}
      {!globeReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">{lang === 'bm' ? 'Memuatkan glob...' : 'Loading globe...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
