import React, { useMemo } from 'react';

interface SpaceBackgroundProps {
  isDark: boolean;
}

export default function SpaceBackground({ isDark }: SpaceBackgroundProps) {
  const stars = useMemo(() => {
    const s: { x: number; y: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 200; i++) {
      s.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }
    return s;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, #0a1628 0%, #050d1a 40%, #020409 100%)'
            : 'radial-gradient(ellipse at 50% 50%, #c9dff7 0%, #a3c4e8 40%, #7ba8d4 100%)',
        }}
      />
      {/* Stars */}
      <svg className="absolute inset-0 w-full h-full">
        {stars.map((star, i) => (
          <circle
            key={i}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill={isDark ? '#ffffff' : '#e0ecff'}
            opacity={star.opacity * (isDark ? 1 : 0.5)}
          />
        ))}
      </svg>
      {/* Nebula glow for dark mode */}
      {isDark && (
        <>
          <div
            className="absolute"
            style={{
              top: '10%', left: '60%',
              width: '300px', height: '300px',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: '60%', left: '20%',
              width: '250px', height: '250px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
        </>
      )}
    </div>
  );
}
