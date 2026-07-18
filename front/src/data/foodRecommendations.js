// Client-side copy: specific food suggestions + "why" text per nutrition tag.
// The backend's cautions (backend/app/services/guide_service.py) and weekly
// findings (backend/app/services/analysis_service.py) only carry a tag +
// generic symptom text, not concrete food picks — those live here, keyed by
// the same tag strings backend/app/repositories/school_meal_repo.py seeds
// into nutrition_rules, so the picks always match what was actually flagged.
export const FOOD_RECOMMENDATIONS = {
  매운맛: [
    { type: 'porridge', label: '죽', reason: '맵고 자극적인 음식으로 지친 위에 부드러운 죽이 부담을 덜어줘요.' },
    { type: 'banana', label: '바나나', reason: '위 점막을 보호하고 소화를 도와줘요.' },
    { type: 'tea', label: '매실차', reason: '소화를 돕는 성분이 있어 속을 편하게 가라앉혀줘요.' },
  ],
  고당분: [
    { type: 'water', label: '물', reason: '물을 충분히 마시면 혈당 조절과 피부 트러블 완화에 도움이 돼요.' },
    { type: 'fruit', label: '제철 과일', reason: '자연당 위주라 혈당을 천천히 올려 부담이 적어요.' },
    { type: 'vegetable', label: '채소', reason: '식이섬유가 당 흡수 속도를 늦춰줘요.' },
  ],
  고지방: [
    { type: 'vegetable', label: '채소', reason: '기름진 음식의 소화를 도와줘요.' },
    { type: 'yogurt', label: '요거트', reason: '장 건강을 도와 속을 편하게 해줘요.' },
    { type: 'water', label: '물', reason: '지방 대사를 돕고 속더부룩함을 줄여줘요.' },
  ],
  튀김: [
    { type: 'vegetable', label: '채소', reason: '튀긴 음식의 소화를 도와줘요.' },
    { type: 'yogurt', label: '요거트', reason: '장 건강을 도와 속을 편하게 해줘요.' },
    { type: 'water', label: '물', reason: '기름진 음식의 대사를 도와줘요.' },
  ],
  고나트륨: [
    { type: 'water', label: '물', reason: '나트륨 배출을 도와 붓기를 줄여줘요.' },
    { type: 'banana', label: '바나나', reason: '칼륨이 풍부해 나트륨 배출을 도와줘요.' },
    { type: 'vegetable', label: '채소', reason: '수분과 칼륨을 함께 채워줘요.' },
  ],
  유제품: [
    { type: 'water', label: '물', reason: '소화를 돕고 속을 편하게 해줘요.' },
    { type: 'vegetable', label: '채소', reason: '식이섬유가 장 활동을 도와줘요.' },
    { type: 'fruit', label: '과일', reason: '가벼운 간식으로 부담이 적어요.' },
  ],
};

export const DEFAULT_RECOMMENDATION = [
  { type: 'rice', label: '잡곡밥', reason: '다양한 영양소를 골고루 챙길 수 있어요.' },
  { type: 'vegetable', label: '제철 채소', reason: '비타민과 식이섬유를 더해줘요.' },
  { type: 'soup', label: '된장국', reason: '단백질과 미네랄을 채워줘요.' },
];

export function getRecommendationForTag(tag) {
  return FOOD_RECOMMENDATIONS[tag] || DEFAULT_RECOMMENDATION;
}