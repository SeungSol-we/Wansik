import { GhostBody, GhostArm, GhostFace, WitchHat, SparkleStar, GHOST_COLORS } from './ghostParts';

// Home hero: fortune-teller ghost holding a magnifying glass, curious mood.
export function FortuneGhost({ size = 150, className }) {
  return (
    <svg width={size} height={size * 1.05} viewBox="0 0 160 168" className={className}>
      <WitchHat x={80} y={-6} scale={0.62} />
      <GhostBody />
      <GhostFace mood="happy" />
      <GhostArm side="right" pose="up" />
      {/* magnifying glass held up near the face */}
      <g transform="translate(126 78) rotate(18)">
        <circle cx="0" cy="0" r="14" fill="rgba(255,255,255,0.35)" stroke={GHOST_COLORS.outline} strokeWidth="3" />
        <line x1="10" y1="10" x2="22" y2="22" stroke={GHOST_COLORS.outline} strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Tummy-ache ghost: worried mood, hands clasped on the belly, pain marks.
export function HurtingGhost({ size = 150, className }) {
  return (
    <svg width={size} height={size * 1.05} viewBox="0 0 160 168" className={className}>
      <GhostBody />
      <GhostFace mood="worried" />
      <ellipse cx="80" cy="126" rx="18" ry="14" fill={GHOST_COLORS.bodyShade} opacity="0.5" />
      <g stroke="#E2603A" strokeWidth="3.2" strokeLinecap="round" fill="none">
        <path d="M46 60 l7 10 -9 3 8 9" />
        <path d="M112 58 l-7 10 9 3 -8 9" />
      </g>
    </svg>
  );
}

// Tiny full-body wizard waving, used for small "advice" callouts.
export function TinyWizardGhost({ size = 90, className }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 160 190" className={className}>
      <WitchHat x={78} y={-4} scale={0.58} />
      <path d="M40 108 C34 140 34 160 44 172 C60 182 100 182 116 172 C126 160 126 140 120 108 Z" fill={GHOST_COLORS.hat} opacity="0.92" />
      <path d="M40 108 C34 140 34 160 44 172 C60 182 100 182 116 172 C126 160 126 140 120 108" fill="none" stroke={GHOST_COLORS.outline} strokeWidth="2" />
      <GhostArm side="right" pose="up" />
      <GhostBody />
      <GhostFace mood="happy" eyeCx={[64, 96]} eyeCy={74} />
      <g transform="translate(126 78) rotate(25)">
        <line x1="0" y1="0" x2="0" y2="34" stroke={GHOST_COLORS.hatShade} strokeWidth="4" strokeLinecap="round" />
        <SparkleStar x={0} y={-4} size={7} />
      </g>
      <SparkleStar x={30} y={40} size={5} opacity={0.8} />
    </svg>
  );
}

// Weekly-report hero: ghost gazing into a glowing crystal ball.
export function CrystalBallGhost({ size = 170, className }) {
  return (
    <svg width={size} height={size * 1.05} viewBox="0 0 160 168" className={className}>
      <WitchHat x={80} y={-6} scale={0.68} />
      <GhostArm side="left" pose="hug" />
      <GhostArm side="right" pose="hug" />
      <GhostBody />
      <GhostFace mood="sleepy" />
      <g transform="translate(80 140)">
        <ellipse cx="0" cy="10" rx="26" ry="7" fill="#1a1430" opacity="0.4" />
        <circle cx="0" cy="0" r="20" fill="url(#crystalGradient)" stroke={GHOST_COLORS.hatBand} strokeWidth="2" />
        <SparkleStar x={-6} y={-6} size={4} color="#fff" opacity={0.9} />
        <SparkleStar x={7} y={4} size={3} color="#fff" opacity={0.7} />
        <defs>
          <radialGradient id="crystalGradient" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#efe3ff" />
            <stop offset="60%" stopColor="#b39ce8" />
            <stop offset="100%" stopColor="#6b57ad" />
          </radialGradient>
        </defs>
      </g>
    </svg>
  );
}

const CONDITION_META = {
  stomach: { mood: 'worried', mark: 'zigzag' },
  constipation: { mood: 'sleepy', mark: 'swirl' },
  skin: { mood: 'surprised', mark: 'dots' },
};

// Small icon-sized ghost used in the "watch out for" trio.
export function ConditionGhost({ type = 'stomach', size = 64, className }) {
  const meta = CONDITION_META[type] || CONDITION_META.stomach;
  return (
    <svg width={size} height={size * 1.05} viewBox="0 0 160 168" className={className}>
      <GhostBody />
      <GhostFace mood={meta.mood} />
      {meta.mark === 'zigzag' && (
        <path d="M60 118 l8 10 -10 3 9 9" stroke="#E2603A" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
      {meta.mark === 'swirl' && (
        <path d="M68 118 q12 -4 12 8 t-12 8" stroke="#B5822A" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
      {meta.mark === 'dots' && (
        <>
          <circle cx="58" cy="120" r="4" fill="#E2603A" opacity="0.8" />
          <circle cx="76" cy="128" r="3" fill="#E2603A" opacity="0.6" />
          <circle cx="92" cy="118" r="3.5" fill="#E2603A" opacity="0.7" />
        </>
      )}
    </svg>
  );
}