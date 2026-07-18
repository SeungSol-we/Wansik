import { SparkleStar } from './ghostParts';

export function TarotCardBack({ selected = false, disabled = false, onClick, size = 88 }) {
  const height = size * 1.42;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="tap-target"
      style={{
        width: size,
        height,
        borderRadius: 14,
        border: `2px solid ${selected ? '#EACB6E' : '#4a3f73'}`,
        background: 'linear-gradient(160deg, #352c5c 0%, #241c3d 100%)',
        boxShadow: selected ? '0 0 0 3px rgba(234,203,110,0.35), 0 10px 22px rgba(0,0,0,0.35)' : '0 6px 14px rgba(0,0,0,0.3)',
        transform: selected ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
        transition: 'all 0.25s ease',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="타로 카드"
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${height}`}>
        <rect x="6" y="6" width={size - 12} height={height - 12} rx="8" fill="none" stroke="#8879c4" strokeWidth="1" opacity="0.6" />
        <circle cx={size / 2} cy={height / 2} r={size * 0.28} fill="none" stroke="#EACB6E" strokeWidth="1.4" opacity="0.85" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const r1 = size * 0.28;
          const r2 = size * 0.4;
          const cx = size / 2;
          const cy = height / 2;
          return (
            <line
              key={i}
              x1={cx + Math.cos(angle) * r1}
              y1={cy + Math.sin(angle) * r1}
              x2={cx + Math.cos(angle) * r2}
              y2={cy + Math.sin(angle) * r2}
              stroke="#EACB6E"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}
        <SparkleStar x={size / 2} y={height / 2} size={size * 0.1} color="#EACB6E" />
        {[[16, 16], [size - 16, 16], [16, height - 16], [size - 16, height - 16]].map(([x, y], i) => (
          <SparkleStar key={i} x={x} y={y} size={4} color="#8879c4" opacity={0.7} />
        ))}
      </svg>
    </button>
  );
}

export function TarotFrame({ label, children }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: '2px solid #d4b877',
        background: 'linear-gradient(180deg, #fff6e2 0%, #fdf8ec 100%)',
        padding: '16px 14px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
      {label && (
        <div
          className="title-display"
          style={{
            fontSize: 13,
            letterSpacing: '0.12em',
            color: '#2d2350',
            border: '1.5px solid #d4b877',
            borderRadius: 999,
            padding: '3px 14px',
            marginTop: 4,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}