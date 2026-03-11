import React from 'react';
import { Compass } from 'lucide-react';

export default function CompassRose() {
  return (
    <div className="absolute bottom-14 left-3 z-20 bg-card/90 backdrop-blur-sm border border-border rounded-full w-12 h-12 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        <Compass className="w-6 h-6 text-primary" />
        <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[6px] font-bold text-foreground">N</span>
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[6px] font-bold text-foreground">S</span>
        <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[6px] font-bold text-foreground">E</span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[6px] font-bold text-foreground">W</span>
      </div>
    </div>
  );
}
