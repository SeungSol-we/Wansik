// Local fallback fixtures used only when the FastAPI backend (기술명세서 §2) is
// unreachable, so the UI stays demoable before ai-service/backend are wired up.
// Shapes mirror the real endpoint responses documented in 기술명세서 §5.

export const MOCK_SCHOOL_MEAL = {
  available: true,
  meal_type: 'lunch',
  items: [
    { food_id: 'f1', name: '현미밥' },
    { food_id: 'f2', name: '순두부찌개' },
    { food_id: 'f3', name: '제육볶음' },
    { food_id: 'f4', name: '콩나물무침' },
    { food_id: 'f5', name: '배추김치' },
  ],
};

export const MOCK_MEAL_GUIDE = {
  cautions: [
    {
      food_name: '제육볶음',
      possible_symptom: '소화불량, 속쓰림',
      recommendation: '수분을 충분히 섭취하고, 부드러운 음식을 함께 드세요.',
      severity: 'MEDIUM',
    },
    {
      food_name: '순두부찌개',
      possible_symptom: '나트륨 과다로 인한 붓기',
      recommendation: '물을 평소보다 조금 더 마셔보세요.',
      severity: 'LOW',
    },
  ],
  eating_order: [
    { step: 1, food_name: '콩나물무침', category: '채소' },
    { step: 2, food_name: '제육볶음', category: '단백질' },
    { step: 3, food_name: '현미밥', category: '탄수화물' },
    { step: 4, food_name: '순두부찌개', category: '국물' },
  ],
};

export const MOCK_WEEKLY_REPORT = {
  period_start: '2026-07-13',
  period_end: '2026-07-19',
  summary_text: '위장이 예민한 한 주였어요. 매운 음식과 기름진 음식을 자주 먹었어요. 소화불량이 생길 수 있으니 부드러운 음식을 선택해보세요.',
  illustration_key: 'stomach',
  theme_title: '위장 주의 주간',
  theme_subtitle: '소화불량과 변비가 생길 수 있어요!',
  findings: [
    { tag: '매운맛', frequency: 5, predicted_symptom: '소화불량', message: '매운 음식 섭취가 많았어요' },
    { tag: '수분부족', frequency: 4, predicted_symptom: '변비', message: '수분 섭취가 부족했어요' },
    { tag: '불규칙식사', frequency: 3, predicted_symptom: '위장 부담', message: '식사 시간이 불규칙했어요' },
  ],
  watch_conditions: [
    { type: 'stomach', label: '소화불량' },
    { type: 'constipation', label: '변비' },
    { type: 'skin', label: '피부 트러블' },
  ],
  recommended_habits: [
    '채소와 식이섬유를 충분히 섭취하기',
    '물 하루 1.5L 마시기',
    '규칙적인 식사 시간 지키기',
  ],
  quote: '건강한 습관이 최고의 운세를 만들어요!',
};

export const MOCK_HEALTH_PROFILE = {
  allergies: ['땅콩', '새우'],
  diet_type: 'none',
  conditions: ['비염'],
};

export const MOCK_RECOGNITION = {
  recognition_status: 'SUCCESS',
  candidates: [
    { food_name_raw: '떡볶이', confidence: 0.91, matched_food_id: 'f10', low_confidence: false },
    { food_name_raw: '순대', confidence: 0.54, matched_food_id: 'f11', low_confidence: true },
  ],
  fallback_required: false,
};

export const TODAY_SUMMARY = {
  fortune_title: '위장이 예민한 하루예요',
  fortune_desc: '매운 음식과 기름진 음식을 자주 먹었어요.\n소화불량이 생길 수 있으니\n부드러운 음식을 선택해보세요.',
  habit_summary: [
    { label: '맵고 자극적인 음식', value: '많이 먹었어요', tone: 'red' },
    { label: '채소 섭취', value: '부족해요', tone: 'green' },
    { label: '물 섭취', value: '적당했어요', tone: 'blue' },
  ],
  recommended_foods: [
    { type: 'tea', label: '매실차' },
    { type: 'banana', label: '바나나' },
    { type: 'porridge', label: '죽' },
  ],
};

export const TAROT_CARDS = [
  {
    id: 'stomach',
    label: 'THE STOMACH',
    icon: 'fire',
    title: '소화불량',
    desc: '위장이 지쳐있어요.\n야식이나 자극적인 음식이\n원인일 수 있어요.',
    keywords: ['매운 음식', '야식', '소화 부담', '수면 부족'],
    advice: '다음 식사는 부드럽고\n소화가 잘 되는 음식을 선택하고,\n따뜻한 차를 마셔보세요.',
    foods: [
      { type: 'porridge', label: '죽' },
      { type: 'banana', label: '바나나' },
      { type: 'tea', label: '매실차' },
    ],
  },
  {
    id: 'skin',
    label: 'THE SKIN',
    icon: 'sparkle',
    title: '피부 트러블',
    desc: '당분이 많은 음식을\n자주 섭취했어요.\n피부가 예민해질 수 있어요.',
    keywords: ['고당분', '기름진 음식', '수분 부족', '야식'],
    advice: '물을 충분히 마시고\n채소와 과일 위주로\n다음 식사를 구성해보세요.',
    foods: [
      { type: 'vegetable', label: '샐러드' },
      { type: 'water', label: '물' },
      { type: 'fruit', label: '과일' },
    ],
  },
  {
    id: 'energy',
    label: 'THE ENERGY',
    icon: 'zzz',
    title: '기력 저하',
    desc: '불규칙한 식사 시간으로\n영양 균형이 무너졌어요.\n기운이 없을 수 있어요.',
    keywords: ['불규칙 식사', '결식', '단백질 부족', '수면 부족'],
    advice: '규칙적인 시간에\n단백질이 포함된 식사를\n챙겨보세요.',
    foods: [
      { type: 'yogurt', label: '요거트' },
      { type: 'rice', label: '잡곡밥' },
      { type: 'soup', label: '된장국' },
    ],
  },
];