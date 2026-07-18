// backend/app/repositories/school_meal_repo.py 의 nutrition_rules 시드 값 기준
// predicted_symptom 문구로 어울리는 마스코트를 고른다 — 같은 증상은 항상 같은
// 이미지가 나오도록 텍스트 키워드로 매칭한다 (인덱스로 그냥 돌려쓰면 실제
// 증상과 이미지가 무관해진다).
export function mascotForSymptom(symptom) {
  if (!symptom) return 'sad';
  if (symptom.includes('피부') || symptom.includes('여드름') || symptom.includes('혈당')) return 'sadAlt';
  if (symptom.includes('붓기') || symptom.includes('갈증') || symptom.includes('팽만')) return 'thinking';
  return 'sad';
}