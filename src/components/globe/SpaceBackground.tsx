import React, { useMemo } from 'react';

interface SpaceBackgroundProps {
  isDark: boolean;
}

export default function SpaceBackground({ isDark }: SpaceBackgroundProps) {
  const stars = useMemo(() => {
    const s: { x: number; y: number; size: number; opacity: number; delay: number }[] = [];
    for (let i = 0; i < 200; i++) {
      s.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        delay: Math.random() * 4,
      });
    }
    return s;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Navy blue radial gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, hsl(220, 50%, 12%) 0%, hsl(220, 55%, 7%) 40%, hsl(220, 60%, 3%) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, hsl(210, 50%, 85%) 0%, hsl(210, 45%, 75%) 40%, hsl(210, 40%, 65%) 100%)',
        }}
      />
      {/* Twinkling stars */}
      <svg className="absolute inset-0 w-full h-full">
        {stars.map((star, i) => (
          <circle
            key={i}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill={isDark ? '#ffffff' : '#e0ecff'}
            opacity={star.opacity * (isDark ? 1 : 0.5)}
            className="animate-pulse"
            style={{ animationDelay: `${star.delay}s`, animationDuration: `${2 + star.delay}s` }}
          />
        ))}
      </svg>
      {/* Nebula glow — 2x more vibrant in dark mode */}
      {isDark && (
        <>
          <div
            className="absolute"
            style={{
              top: '10%', left: '60%',
              width: '400px', height: '400px',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.20) 0%, transparent 70%)',
              filter: 'blur(35px)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: '55%', left: '15%',
              width: '350px', height: '350px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        </>
      )}
    </div>
  );
}
