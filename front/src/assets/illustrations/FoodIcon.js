const ICONS = {
  porridge: (
    <>
      <ellipse cx="16" cy="20" rx="12" ry="6" fill="#E8D9B5" />
      <path d="M4 20 Q4 28 16 28 Q28 28 28 20 Z" fill="#F3E7C9" stroke="#D8C295" strokeWidth="1.2" />
      <ellipse cx="16" cy="19" rx="9" ry="4.2" fill="#FBF3DC" />
      <path d="M12 8 q1 -3 -1 -5 M17 6 q1 -3 -1 -5" stroke="#D8C295" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7" />
    </>
  ),
  banana: (
    <>
      <path
        d="M9 24 C7 17 9 9 17 6 C18.5 5.6 19 7.2 17.8 7.8 C11.6 10.8 10.2 17.4 12 23 C12.5 24.5 9.5 25.6 9 24 Z"
        fill="#F4D35E"
        stroke="#D9A441"
        strokeWidth="1.1"
      />
      <path d="M17 6 C19 5 21 5.4 21.5 7" stroke="#8a5a2b" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </>
  ),
  tea: (
    <>
      <path d="M6 12 H22 L20.5 24 A2 2 0 0 1 18.5 26 H9.5 A2 2 0 0 1 7.5 24 Z" fill="#D9A441" opacity="0.85" />
      <path d="M22 14 C27 14 27 21 22 21" fill="none" stroke="#B5822A" strokeWidth="1.6" />
      <path d="M10 6 q2 3 0 5 M14 5 q2 3 0 5 M18 6 q2 3 0 5" stroke="#B5822A" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
    </>
  ),
  vegetable: (
    <>
      <path d="M16 28 C10 28 6 22 8 15 C9.5 10 14 8 16 8 C18 8 22.5 10 24 15 C26 22 22 28 16 28 Z" fill="#8FBF7F" />
      <path d="M16 8 C15 4 12 3 10 4 C11 6.5 13 8 16 8 Z" fill="#5C9A56" />
      <path d="M16 8 C17.5 4.5 21 3.6 23 5 C21.5 7 19 8 16 8 Z" fill="#6FAE63" />
    </>
  ),
  water: (
    <>
      <path d="M16 4 C22 13 25 18 25 22 A9 9 0 0 1 7 22 C7 18 10 13 16 4 Z" fill="#7FB8DE" stroke="#3E7CB8" strokeWidth="1.1" />
      <ellipse cx="13" cy="20" rx="2.4" ry="3.4" fill="#EAF4FB" opacity="0.7" />
    </>
  ),
  rice: (
    <>
      <ellipse cx="16" cy="21" rx="12" ry="6.5" fill="#F3E7C9" stroke="#D8C295" strokeWidth="1.1" />
      <ellipse cx="16" cy="15" rx="9" ry="7" fill="#FBF3DC" stroke="#D8C295" strokeWidth="1" />
    </>
  ),
  soup: (
    <>
      <path d="M5 15 H27 L25 24 A3 3 0 0 1 22 27 H10 A3 3 0 0 1 7 24 Z" fill="#E2603A" opacity="0.85" />
      <path d="M27 16 C31 16 31 22 27 22" fill="none" stroke="#B5822A" strokeWidth="1.6" />
      <path d="M11 8 q2 3 0 5 M16 7 q2 3 0 5 M21 8 q2 3 0 5" stroke="#c46a4a" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
    </>
  ),
  yogurt: (
    <>
      <path d="M11 8 H21 L20 26 A2 2 0 0 1 18 28 H14 A2 2 0 0 1 12 26 Z" fill="#F6F1E4" stroke="#D8C295" strokeWidth="1.1" />
      <rect x="10" y="6" width="12" height="4" rx="1.5" fill="#7FB8DE" />
    </>
  ),
  fruit: (
    <>
      <circle cx="14" cy="18" r="8" fill="#E2603A" />
      <circle cx="21" cy="19" r="6.5" fill="#F4845E" />
      <path d="M15 10 q1 -3 -1 -5" stroke="#5C9A56" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M14 8 C12 6 9 6.6 9 9" stroke="#5C9A56" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </>
  ),
};

export function FoodIcon({ type = 'rice', size = 30 }) {
  const icon = ICONS[type] || ICONS.rice;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      {icon}
    </svg>
  );
}

export const FOOD_ICON_TYPES = Object.keys(ICONS);