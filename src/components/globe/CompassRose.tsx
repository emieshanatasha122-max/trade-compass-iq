import React from 'react';

interface CompassRoseProps {
  angle?: number;
}

export default function CompassRose({ angle = 0 }: CompassRoseProps) {
  return (
    <div className="absolute bottom-6 left-6 z-20">
      {/* Rotating compass container */}
      <div
        className="relative w-14 h-14 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <svg viewBox="0 0 60 60" className="w-11 h-11">
          <circle
            cx="30"
            cy="30"
            r="28"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />

          {/* Tick marks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = i * 30;
            const r1 = 25;
            const r2 = 28;
            const rad = (a * Math.PI) / 180;

            return (
              <line
                key={i}
                x1={30 + r1 * Math.sin(rad)}
                y1={30 - r1 * Math.cos(rad)}
                x2={30 + r2 * Math.sin(rad)}
                y2={30 - r2 * Math.cos(rad)}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={i % 3 === 0 ? 1.5 : 0.5}
                opacity={i % 3 === 0 ? 1 : 0.5}
              />
            );
          })}

          {/* North pointer */}
          <polygon
            points="30,6 27,20 33,20"
            fill="hsl(var(--destructive))"
          />

          {/* South pointer */}
          <polygon
            points="30,54 27,40 33,40"
            fill="hsl(var(--muted-foreground))"
            opacity="0.4"
          />

          {/* East-West line */}
          <line
            x1="8"
            y1="30"
            x2="18"
            y2="30"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
            opacity="0.4"
          />
          <line
            x1="42"
            y1="30"
            x2="52"
            y2="30"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
            opacity="0.4"
          />

          {/* Center dot */}
          <circle cx="30" cy="30" r="2" fill="hsl(var(--primary))" />
        </svg>
      </div>

      {/* Fixed labels that counter-rotate to remain readable */}
      <div 
        className="absolute inset-0 w-14 h-14 pointer-events-none"
        style={{ transform: `rotate(${-angle}deg)` }}
      >
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-red-500">
          N
        </div>
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground">
          S
        </div>
        <div className="absolute top-1/2 -right-4 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
          E
        </div>
        <div className="absolute top-1/2 -left-4 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
          W
        </div>
      </div>
    </div>
  );
}