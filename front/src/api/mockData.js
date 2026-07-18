// The backend only exposes a *weekly* analysis report (GET /api/v1/analysis/weekly
// — see backend/app/routers/analysis.py). There's no daily-fortune endpoint, but
// the home screen design (기획서 mockup 1) calls for one, so this stays local-only
// until that endpoint exists.
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