// Cat-witch mascot illustrations supplied by the user (front/public/images).
// Swaps in for the hand-drawn SVG ghost — pick the pose that matches the
// screen's mood instead of drawing new art.
const MASCOT_SRC = {
  tarot: '/images/c1.png', // reading tarot cards + crystal ball
  calm: '/images/c2.png', // sitting calmly, sparkly, content
  sad: '/images/c3.png', // crying, tummy-ache pain marks
  sadAlt: '/images/c4.png', // crying, alternate angle
  thinking: '/images/c5.png', // worried / unsure, question-mark doodle
  cheer: '/images/c6.png', // waving wand, happy
  eating: '/images/c7.png', // eating a meal
};

export function Mascot({ type = 'calm', size = 140, className, style }) {
  return (
    <img
      src={MASCOT_SRC[type] || MASCOT_SRC.calm}
      alt=""
      width={size}
      style={{ width: size, height: 'auto', objectFit: 'contain', ...style }}
      className={className}
    />
  );
}