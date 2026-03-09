import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { ALPHA2_TO_ALPHA3 } from '@/data/tradeDataLoader';

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
  destinations: Record<string, { value: number; code: string }>;
}

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

export default function WorldMap({ destinations }: WorldMapProps) {
  // Normalize 2-letter codes to 3-letter for display
  const normalizedDest = useMemo(() => {
    const result: Record<string, { value: number; code: string }> = {};
    Object.entries(destinations).forEach(([code, data]) => {
      const alpha3 = ALPHA2_TO_ALPHA3[code] || code;
      if (!result[alpha3]) result[alpha3] = { value: 0, code: alpha3 };
      result[alpha3].value += data.value;
    });
    return result;
  }, [destinations]);

  const maxValue = useMemo(() => {
    const values = Object.values(normalizedDest).map(d => d.value);
    return Math.max(...values, 1);
  }, [normalizedDest]);

  const getCountryFill = (geoId: string) => {
    const alpha3 = NUM_TO_ALPHA3[geoId];
    if (alpha3 === 'MYS') return 'hsl(187, 72%, 42%)';
    if (alpha3 && normalizedDest[alpha3]) {
      const intensity = Math.max(0.15, normalizedDest[alpha3].value / maxValue);
      return `hsla(187, 72%, 42%, ${intensity})`;
    }
    return 'hsl(var(--muted))';
  };

  const topDest = useMemo(() => {
    return Object.entries(normalizedDest)
      .filter(([code]) => COUNTRY_COORDS[code])
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 8);
  }, [normalizedDest]);

  return (
    <div className="w-full" style={{ maxHeight: 380 }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [80, 10] }}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => {
              const geoId = geo.id || geo.properties?.iso_a3_eh;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getCountryFill(String(geoId))}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: 'hsl(187, 60%, 45%)', outline: 'none', cursor: 'pointer' },
                    pressed: { outline: 'none' },
                  }}
                />
              );
            })
          }
        </Geographies>

        {topDest.map(([code, data]) => (
          <Line
            key={code}
            from={MALAYSIA_COORDS}
            to={COUNTRY_COORDS[code]}
            stroke="hsl(187, 72%, 42%)"
            strokeWidth={Math.max(0.8, (data.value / maxValue) * 3)}
            strokeOpacity={0.35}
            strokeLinecap="round"
          />
        ))}

        <Marker coordinates={MALAYSIA_COORDS}>
          <circle r={4} fill="hsl(187, 72%, 42%)" />
          <circle r={8} fill="hsl(187, 72%, 42%)" opacity={0.2} />
        </Marker>

        {topDest.map(([code, data]) => (
          <Marker key={code} coordinates={COUNTRY_COORDS[code]}>
            <circle r={3} fill="hsl(42, 70%, 50%)" />
            <text
              textAnchor="middle"
              y={-8}
              style={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))', fontFamily: 'Inter' }}
            >
              {code} {formatRM(data.value)}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
