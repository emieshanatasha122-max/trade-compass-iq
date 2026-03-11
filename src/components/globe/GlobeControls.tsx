import React from 'react';
import { Plus, Minus, Map, Satellite } from 'lucide-react';

interface GlobeControlsProps {
  lang: 'bm' | 'en';
  tradeView: 'all' | 'export' | 'import';
  onTradeViewChange: (v: 'all' | 'export' | 'import') => void;
  basemap: 'satellite' | 'map';
  onBasemapChange: (v: 'satellite' | 'map') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function GlobeControls({
  lang, tradeView, onTradeViewChange,
  basemap, onBasemapChange,
  onZoomIn, onZoomOut,
}: GlobeControlsProps) {
  return (
    <>
      {/* Trade view toggle - top left */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
        {(['all', 'export', 'import'] as const).map(v => (
          <button
            key={v}
            onClick={() => onTradeViewChange(v)}
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

      {/* Basemap switcher - top right */}
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

      {/* Zoom buttons - right side */}
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

      {/* Legend - bottom right */}
      <div className="absolute bottom-3 right-3 z-20 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2.5 text-[10px]">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-3 h-0.5 rounded bg-[#10B981]" />
          <span className="text-muted-foreground">{lang === 'bm' ? 'Eksport' : 'Export'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded bg-[#EF4444]" />
          <span className="text-muted-foreground">{lang === 'bm' ? 'Import' : 'Import'}</span>
        </div>
      </div>
    </>
  );
}
