// Shared building blocks for the ghost-witch mascot illustrations.
// Kept as plain data/JSX fragments so every scene composes the same
// body silhouette instead of hand-drawing a new blob each time.

export const GHOST_COLORS = {
  body: '#C9BEE6',
  bodyShade: '#B2A5DA',
  outline: '#5B4E8C',
  cheek: '#F3B6C0',
  hat: '#6B5CA5',
  hatShade: '#584A8C',
  hatBand: '#D9A441',
  star: '#EACB6E',
};

// A single rounded "plush blob" body path, reused by every mascot pose.
export const BODY_PATH =
  'M80 6 C114 6 138 30 140 64 C141.5 88 138 106 130 122 C122 138 118 150 110 156 C96 165 64 165 50 156 C42 150 38 138 30 122 C22 106 18.5 88 20 64 C22 30 46 6 80 6 Z';

export function GhostBody({ color = GHOST_COLORS.body, outline = GHOST_COLORS.outline }) {
  return (
    <>
      <path d={BODY_PATH} fill={color} stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="100" cy="118" rx="16" ry="22" fill={GHOST_COLORS.bodyShade} opacity="0.45" />
    </>
  );
}

export function GhostArm({ side = 'left', pose = 'down' }) {
  const flip = side === 'right';
  const x = flip ? 132 : 28;
  const rotate = pose === 'up' ? (flip ? -35 : 35) : pose === 'hug' ? (flip ? -60 : 60) : flip ? -12 : 12;
  return (
    <ellipse
      cx={x}
      cy={pose === 'up' ? 88 : 112}
      rx="12"
      ry="17"
      fill={GHOST_COLORS.body}
      stroke={GHOST_COLORS.outline}
      strokeWidth="2.5"
      transform={`rotate(${rotate} ${x} ${pose === 'up' ? 88 : 112})`}
    />
  );
}

export function GhostFace({ mood = 'happy', eyeCx = [64, 96], eyeCy = 78 }) {
  const [lx, rx] = eyeCx;
  return (
    <g>
      <ellipse cx={lx - 14} cy={eyeCy + 16} rx="9" ry="6" fill={GHOST_COLORS.cheek} opacity="0.8" />
      <ellipse cx={rx + 14} cy={eyeCy + 16} rx="9" ry="6" fill={GHOST_COLORS.cheek} opacity="0.8" />

      {mood === 'worried' ? (
        <>
          <path d={`M${lx - 7} ${eyeCy - 6} q7 -7 14 0`} stroke={GHOST_COLORS.outline} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d={`M${rx - 7} ${eyeCy - 6} q7 -7 14 0`} stroke={GHOST_COLORS.outline} strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx={lx} cy={eyeCy + 4} r="4.5" fill={GHOST_COLORS.outline} />
          <circle cx={rx} cy={eyeCy + 4} r="4.5" fill={GHOST_COLORS.outline} />
          <path d={`M${lx - 6} ${eyeCy + 26} q${(rx - lx) / 2} 8 ${rx - lx + 6} 0`} stroke={GHOST_COLORS.outline} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : mood === 'surprised' ? (
        <>
          <circle cx={lx} cy={eyeCy} r="5.5" fill={GHOST_COLORS.outline} />
          <circle cx={rx} cy={eyeCy} r="5.5" fill={GHOST_COLORS.outline} />
          <ellipse cx={(lx + rx) / 2} cy={eyeCy + 24} rx="6" ry="7" fill={GHOST_COLORS.outline} opacity="0.85" />
        </>
      ) : mood === 'sleepy' ? (
        <>
          <path d={`M${lx - 7} ${eyeCy} q7 6 14 0`} stroke={GHOST_COLORS.outline} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d={`M${rx - 7} ${eyeCy} q7 6 14 0`} stroke={GHOST_COLORS.outline} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d={`M${lx - 5} ${eyeCy + 22} q5 5 10 0`} stroke={GHOST_COLORS.outline} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={lx} cy={eyeCy} r="5.5" fill={GHOST_COLORS.outline} />
          <circle cx={lx + 2} cy={eyeCy - 2} r="1.6" fill="#fff" />
          <circle cx={rx} cy={eyeCy} r="5.5" fill={GHOST_COLORS.outline} />
          <circle cx={rx + 2} cy={eyeCy - 2} r="1.6" fill="#fff" />
          <path d={`M${(lx + rx) / 2 - 6} ${eyeCy + 20} q6 6 12 0`} stroke={GHOST_COLORS.outline} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

export function WitchHat({ x = 80, y = 4, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="26" rx="34" ry="8" fill={GHOST_COLORS.hat} stroke={GHOST_COLORS.outline} strokeWidth="2" />
      <path d="M-20 26 C-16 -6 8 -46 4 -70 C24 -40 20 -2 22 26 Z" fill={GHOST_COLORS.hat} stroke={GHOST_COLORS.outline} strokeWidth="2" strokeLinejoin="round" />
      <path d="M-16 14 C-10 -10 6 -40 2 -60" stroke={GHOST_COLORS.hatShade} strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round" />
      <ellipse cx="0" cy="16" rx="24" ry="5" fill={GHOST_COLORS.hatBand} />
      <path
        d="M4 -70 l3 6 6.5 0.8 -4.8 4.4 1.2 6.4L4 -55.9 -1.9 -52.4 -0.7 -58.8 -5.5 -63.2 1 -64 Z"
        fill={GHOST_COLORS.star}
      />
    </g>
  );
}

export function SparkleStar({ x, y, size = 8, color = GHOST_COLORS.star, opacity = 1 }) {
  const s = size;
  return (
    <path
      d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`}
      fill={color}
      opacity={opacity}
    />
  );
}