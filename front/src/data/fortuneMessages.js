// Client-side copy keyed by the same illustration_key the backend computes
// from the week's most frequent tag (backend/app/services/analysis_service.py
// :_illustration_key_for_tag). There's no daily-fortune endpoint, so this is
// the best real signal available — the Home screen's "오늘의 운세" now tracks
// actual eating patterns instead of always showing the same stomach message.
export const FORTUNE_MESSAGES = {
  stomach_ache: {
    title: '위장이 예민한 하루예요',
    desc: '매운 음식과 기름진 음식을 자주 먹었어요.\n소화불량이 생길 수 있으니\n부드러운 음식을 선택해보세요.',
  },
  skin_trouble: {
    title: '피부가 예민해질 수 있어요',
    desc: '당분이 많은 음식을 자주 먹었어요.\n피부 트러블이 생길 수 있으니\n물과 채소를 충분히 챙겨보세요.',
  },
  bloating: {
    title: '속이 더부룩할 수 있어요',
    desc: '기름지거나 튀긴 음식을 자주 먹었어요.\n소화가 더딜 수 있으니\n가벼운 음식으로 균형을 맞춰보세요.',
  },
  puffy_face: {
    title: '붓기가 생길 수 있어요',
    desc: '나트륨이 많은 음식을 자주 먹었어요.\n붓기와 갈증이 생길 수 있으니\n물을 충분히 마셔보세요.',
  },
  general_caution: {
    title: '식습관을 점검해볼 때예요',
    desc: '최근 식사 패턴이 조금 불규칙했어요.\n규칙적인 시간에 골고루 먹어보세요.',
  },
  balanced: {
    title: '오늘은 컨디션이 좋아 보여요',
    desc: '최근 균형 잡힌 식사를 하고 있어요.\n지금처럼 골고루, 규칙적으로 챙겨보세요.',
  },
  default: {
    title: '아직 알려드릴 운세가 없어요',
    desc: '식사를 기록하면 그 주의 식습관에 맞춰\n운세를 알려드릴게요.',
  },
};

export function getFortuneMessage(illustrationKey) {
  return FORTUNE_MESSAGES[illustrationKey] || FORTUNE_MESSAGES.default;
}