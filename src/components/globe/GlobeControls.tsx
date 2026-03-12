import React from 'react';
import { Plus, Minus, Map, Satellite } from 'lucide-react';

interface GlobeControlsProps {
  lang: 'bm' | 'en';
  basemap: 'satellite' | 'map';
  onBasemapChange: (v: 'satellite' | 'map') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function GlobeControls({
  lang, basemap, onBasemapChange, onZoomIn, onZoomOut,
}: GlobeControlsProps) {
  return (
    <>
      {/* Basemap switcher — top right */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <button
          onClick={() => onBasemapChange('satellite')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            basemap === 'satellite'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border'
          }`}
        >
          <Satellite className="w-3 h-3" />
          {lang === 'bm' ? 'Satelit' : 'Satellite'}
        </button>
        <button
          onClick={() => onBasemapChange('map')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            basemap === 'map'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border'
          }`}
        >
          <Map className="w-3 h-3" />
          {lang === 'bm' ? 'Peta' : 'Map'}
        </button>
      </div>

      {/* Zoom buttons — right side */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1">
        <button
          onClick={onZoomIn}
          className="w-9 h-9 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors shadow-sm"
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="w-9 h-9 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors shadow-sm"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
