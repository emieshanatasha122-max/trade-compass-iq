import React, { useMemo } from 'react';

interface SpaceBackgroundProps {
  isDark: boolean;
}

export default function SpaceBackground({ isDark }: SpaceBackgroundProps) {
  const stars = useMemo(() => {
    const s: { x: number; y: number; size: number; opacity: number; delay: number; duration: number }[] = [];

    for (let i = 0; i < (isDark ? 320 : 300); i++) {
      s.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: isDark ? Math.random() * 2.4 + 0.3 : Math.random() * 2.2 + 0.4,
        opacity: isDark ? Math.random() * 0.9 + 0.1 : Math.random() * 0.85 + 0.15,
        delay: Math.random() * 5,
        duration: isDark ? 1.2 + Math.random() * 3 : 1.5 + Math.random() * 3.5,
      });
    }

    return s;
  }, [isDark]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 45%, #020617 0%, #020617 45%, #000000 100%)'
            : 'radial-gradient(ellipse at 50% 45%, #071225 0%, #0b1f3a 42%, #020617 100%)',
        }}
      />

      <div
        className="absolute"
        style={{
          top: isDark ? '-10%' : '-12%',
          left: '-20%',
          width: isDark ? '140%' : '145%',
          height: isDark ? '90%' : '95%',
          background: isDark
            ? 'linear-gradient(120deg, transparent 0%, rgba(56,189,248,0.08) 30%, rgba(147,197,253,0.18) 45%, rgba(139,92,246,0.10) 60%, transparent 80%)'
            : 'linear-gradient(125deg, transparent 0%, rgba(59,130,246,0.10) 26%, rgba(147,197,253,0.28) 43%, rgba(236,72,153,0.13) 52%, rgba(34,211,238,0.16) 64%, transparent 82%)',
          filter: isDark ? 'blur(40px)' : 'blur(34px)',
          transform: 'rotate(-10deg)',
        }}
      />

      <div
        className="absolute"
        style={{
          top: isDark ? '38%' : '36%',
          left: isDark ? '-6%' : '-7%',
          width: '420px',
          height: '420px',
          background: isDark
            ? 'radial-gradient(circle, rgba(255,220,150,1) 0%, rgba(251,146,60,0.45) 20%, rgba(59,130,246,0.12) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(255,220,150,0.95) 0%, rgba(251,146,60,0.35) 18%, rgba(59,130,246,0.16) 42%, transparent 72%)',
          filter: isDark ? 'blur(22px)' : 'blur(18px)',
        }}
      />

      <div
        className="absolute"
        style={{
          top: isDark ? '10%' : '8%',
          left: isDark ? '35%' : '34%',
          width: isDark ? '700px' : '720px',
          height: isDark ? '700px' : '720px',
          background: isDark
            ? 'radial-gradient(circle, rgba(56,189,248,0.28) 0%, rgba(6,182,212,0.15) 40%, transparent 75%)'
            : 'radial-gradient(circle, rgba(125,211,252,0.22) 0%, rgba(56,189,248,0.18) 35%, transparent 72%)',
          filter: isDark ? 'blur(40px)' : 'blur(35px)',
        }}
      />

      {isDark && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      )}

      <svg className="absolute inset-0 w-full h-full">
        {stars.map((star, i) => (
          <circle
            key={i}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill="#ffffff"
            opacity={star.opacity * (isDark ? 0.9 : 0.85)}
            className="animate-pulse"
            style={{
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}