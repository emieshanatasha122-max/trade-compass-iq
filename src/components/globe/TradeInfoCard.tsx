import React from 'react';
import { X } from 'lucide-react';

interface TradeInfoCardProps {
  countryName: string;
  totalValue: number;
  exportValue: number;
  importValue: number;
  topCommodity: string;
  onClose: () => void;
  lang: 'bm' | 'en';
}

function formatRM(value: number): string {
  if (value >= 1e12) return `RM ${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `RM ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `RM ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `RM ${(value / 1e3).toFixed(1)}K`;
  return `RM ${value.toLocaleString()}`;
}

export default function TradeInfoCard({
  countryName, totalValue, exportValue, importValue, topCommodity, onClose, lang,
}: TradeInfoCardProps) {
  return (
    <div className="absolute top-14 right-3 z-30 w-60 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-foreground">Malaysia → {countryName}</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <p className="text-[10px] text-muted-foreground">{lang === 'bm' ? 'Jumlah Dagangan' : 'Total Trade'}</p>
          <p className="text-sm font-bold text-foreground">{formatRM(totalValue)}</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground">{lang === 'bm' ? 'Eksport' : 'Export'}</p>
            <p className="text-xs font-semibold text-[#10B981]">{formatRM(exportValue)}</p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground">{lang === 'bm' ? 'Import' : 'Import'}</p>
            <p className="text-xs font-semibold text-[#EF4444]">{formatRM(importValue)}</p>
          </div>
        </div>
        <div className="pt-1 border-t border-border">
          <p className="text-[10px] text-muted-foreground">{lang === 'bm' ? 'Barangan Utama' : 'Top Commodity'}</p>
          <p className="text-xs font-medium text-foreground">{topCommodity}</p>
        </div>
      </div>
    </div>
  );
}
