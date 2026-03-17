import React, { useMemo } from 'react';

interface SpaceBackgroundProps {
  isDark: boolean;
}

export default function SpaceBackground({ isDark }: SpaceBackgroundProps) {
  const stars = useMemo(() => {
    const s: { x: number; y: number; size: number; opacity: number; delay: number; duration: number }[] = [];
    for (let i = 0; i < 250; i++) {
      s.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.2 + 0.4,
        opacity: Math.random() * 0.85 + 0.15,
        delay: Math.random() * 5,
        duration: 1.5 + Math.random() * 3.5,
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
      {/* Twinkling stars with random delays */}
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
            style={{
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </svg>
      {/* Nebula glow — 2x more vibrant in dark mode */}
      {isDark && (
        <>
          <div
            className="absolute"
            style={{
              top: '5%', left: '55%',
              width: '500px', height: '500px',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.28) 0%, rgba(6, 182, 212, 0.08) 40%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: '50%', left: '10%',
              width: '450px', height: '450px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.24) 0%, rgba(139, 92, 246, 0.06) 40%, transparent 70%)',
              filter: 'blur(35px)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: '30%', left: '75%',
              width: '300px', height: '300px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 60%)',
              filter: 'blur(40px)',
            }}
          />
        </>
      )}
    </div>
  );
}
