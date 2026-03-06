import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { COUNTRY_CODE_MAP } from '@/data/mockTradeData';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Approximate country centroids for markers & flow lines
const COUNTRY_COORDS: Record<string, [number, number]> = {
  SGP: [103.8, 1.35],
  CHN: [104.2, 35.9],
  USA: [-95.7, 37.1],
  JPN: [138.3, 36.2],
  THA: [100.5, 15.9],
  KOR: [127.8, 35.9],
  IND: [78.9, 20.6],
  AUS: [133.8, -25.3],
  DEU: [10.4, 51.2],
  GBR: [-3.4, 55.4],
};

const MALAYSIA_COORDS: [number, number] = [101.7, 3.1];

// ISO 3166-1 numeric → alpha-3 mapping for topojson
const NUM_TO_ALPHA3: Record<string, string> = {
  '702': 'SGP', '156': 'CHN', '840': 'USA', '392': 'JPN',
  '764': 'THA', '410': 'KOR', '356': 'IND', '036': 'AUS',
  '276': 'DEU', '826': 'GBR', '458': 'MYS',
};

interface WorldMapProps {
  destinations: Record<string, { value: number; code: string }>;
}

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  return `RM ${value.toLocaleString()}`;
}

export default function WorldMap({ destinations }: WorldMapProps) {
  const maxValue = useMemo(() => {
    const values = Object.values(destinations).map(d => d.value);
    return Math.max(...values, 1);
  }, [destinations]);

  const getCountryFill = (geoId: string) => {
    const alpha3 = NUM_TO_ALPHA3[geoId];
    if (alpha3 === 'MYS') return 'hsl(187, 92%, 55%)';
    if (alpha3 && destinations[alpha3]) {
      const intensity = Math.max(0.15, destinations[alpha3].value / maxValue);
      return `hsla(187, 92%, 55%, ${intensity})`;
    }
    return 'hsl(222, 30%, 20%)';
  };

  // Top destinations for flow lines
  const topDest = useMemo(() => {
    return Object.entries(destinations)
      .filter(([code]) => COUNTRY_COORDS[code])
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 6);
  }, [destinations]);

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
                  stroke="hsl(222, 30%, 25%)"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: 'hsl(187, 70%, 45%)', outline: 'none', cursor: 'pointer' },
                    pressed: { outline: 'none' },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Flow lines from Malaysia */}
        {topDest.map(([code, data]) => (
          <Line
            key={code}
            from={MALAYSIA_COORDS}
            to={COUNTRY_COORDS[code]}
            stroke="hsl(187, 92%, 55%)"
            strokeWidth={1}
            strokeOpacity={0.4}
            strokeLinecap="round"
          />
        ))}

        {/* Malaysia marker */}
        <Marker coordinates={MALAYSIA_COORDS}>
          <circle r={4} fill="hsl(187, 92%, 55%)" />
          <circle r={8} fill="hsl(187, 92%, 55%)" opacity={0.2} />
        </Marker>

        {/* Destination markers with labels */}
        {topDest.map(([code, data]) => (
          <Marker key={code} coordinates={COUNTRY_COORDS[code]}>
            <circle r={3} fill="hsl(42, 78%, 55%)" />
            <text
              textAnchor="middle"
              y={-8}
              style={{ fontSize: 8, fill: 'hsl(210, 40%, 80%)', fontFamily: 'Plus Jakarta Sans' }}
            >
              {code} {formatRM(data.value)}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
