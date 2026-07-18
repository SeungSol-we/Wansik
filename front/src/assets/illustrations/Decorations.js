import { SparkleStar } from './ghostParts';

const DEFAULT_STARS = [
  { x: 18, y: 22, size: 4 },
  { x: 42, y: 10, size: 3 },
  { x: 80, y: 16, size: 5 },
  { x: 120, y: 26, size: 3 },
  { x: 150, y: 14, size: 4 },
  { x: 170, y: 34, size: 3 },
  { x: 8, y: 52, size: 3 },
  { x: 190, y: 58, size: 4 },
];

export function MoonStars({ width = 220, height = 90, showMoon = true, className, style }) {
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} 90`} className={className} style={{ display: 'block', ...style }} preserveAspectRatio="xMidYMid meet">
      {showMoon && (
        <g transform="translate(30 30)">
          <path d="M18 0 A18 18 0 1 0 18 36 A14 14 0 1 1 18 0 Z" fill="#EFE3C8" opacity="0.95" />
        </g>
      )}
      {DEFAULT_STARS.map((s, i) => (
        <g key={i} style={{ animation: `twinkle ${2.4 + (i % 3) * 0.6}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}>
          <SparkleStar x={s.x} y={s.y} size={s.size} color="#EACB6E" />
        </g>
      ))}
    </svg>
  );
}

export function StringLights({ width = 320, height = 28, className }) {
  const bulbs = Array.from({ length: 9 }).map((_, i) => {
    const t = i / 8;
    const x = 10 + t * (width - 20);
    const y = 6 + Math.sin(t * Math.PI) * 14;
    return { x, y };
  });
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      <path
        d={`M10 6 ${bulbs.map((b) => `L${b.x} ${b.y}`).join(' ')}`}
        stroke="#6a5aa8"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      {bulbs.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="3.4" fill="#EACB6E" opacity={0.65 + (i % 3) * 0.12} />
      ))}
    </svg>
  );
}