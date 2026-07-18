import { useNavigate } from 'react-router-dom';
import { Screen, ScreenBody } from '../components/layout/Screen';
import { BottomNav } from '../components/layout/BottomNav';
import { CrystalBallGhost, ConditionGhost, TinyWizardGhost } from '../assets/illustrations/GhostMascot';
import { MoonStars, StringLights } from '../assets/illustrations/Decorations';
import { useWeeklyReport } from '../hooks/useWeeklyReport';

// 백엔드 AnalysisReportResponse 에는 테마 제목/추천 습관/문구 같은 필드가 없다
// (summary_text, illustration_key, findings[] 뿐 — backend/app/schemas/analysis.py).
// 아래 매핑은 실데이터(illustration_key, finding.tag)를 기반으로 한 프론트 전용
// 카피이며, 서버가 준 문장인 것처럼 보이지 않게 구성한다.
const THEME_META = {
  stomach_ache: { title: '위장 주의 주간', ghost: 'stomach' },
  skin_trouble: { title: '피부 주의 주간', ghost: 'skin' },
  bloating: { title: '더부룩 주의 주간', ghost: 'constipation' },
  puffy_face: { title: '붓기 주의 주간', ghost: 'constipation' },
  general_caution: { title: '식습관 점검 주간', ghost: 'stomach' },
  balanced: { title: '균형 잡힌 한 주', ghost: null },
};

const TAG_TIP = {
  매운맛: '맵고 자극적인 음식은 줄이고 물을 충분히 마셔보세요.',
  고당분: '단 음식 대신 과일이나 무가당 간식은 어떨까요?',
  고지방: '튀긴 음식 대신 구이나 찜 요리를 선택해보세요.',
  튀김: '튀긴 음식 대신 구이나 찜 요리를 선택해보세요.',
  고나트륨: '국물은 조금만, 물은 충분히 마셔보세요.',
  유제품: '유제품은 소량씩 나눠 먹어보세요.',
};
const DEFAULT_TIP = '골고루, 규칙적으로 먹는 습관을 만들어봐요.';

function conditionGhostType(predictedSymptom) {
  if (predictedSymptom.includes('피부')) return 'skin';
  if (predictedSymptom.includes('변비') || predictedSymptom.includes('붓기')) return 'constipation';
  return 'stomach';
}

function formatRange(start, end) {
  if (!start || !end) return '';
  const [, sm, sd] = start.split('-');
  const [, em, ed] = end.split('-');
  return `${Number(sm)}.${Number(sd)} - ${Number(em)}.${Number(ed)}`;
}

function mondayOfThisWeek() {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  now.setDate(now.getDate() - day);
  return now.toISOString().slice(0, 10);
}

export default function WeeklyReportPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useWeeklyReport(mondayOfThisWeek());
  const theme = data ? THEME_META[data.illustration_key] || THEME_META.general_caution : null;

  return (
    <Screen theme="dark">
      <div style={{ position: 'relative', padding: '14px 20px 4px' }}>
        <MoonStars height={64} />
        <StringLights height={22} />
        <p className="eyebrow" style={{ marginTop: 6 }}>이번 주 식습관 운세</p>
        <h1 className="page-title">
          {data ? formatRange(data.period_start, data.period_end) : '이번 주'}
        </h1>
        <div className="center-col" style={{ margin: '4px 0 6px' }}>
          <CrystalBallGhost size={150} className="float" />
        </div>
      </div>

      <ScreenBody>
        {isLoading ? (
          <p className="eyebrow">이번 주 운세를 준비하는 중…</p>
        ) : isError ? (
          <div className="status-banner warn">운세를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</div>
        ) : !data ? (
          <div className="panel panel-navy center-col" style={{ gap: 12, padding: 28 }}>
            <TinyWizardGhost size={90} />
            <p style={{ fontWeight: 700 }}>아직 이번 주 기록이 없어요</p>
            <p style={{ fontSize: 13, color: 'var(--cream-text-dim)', textAlign: 'center' }}>
              식사를 기록하면 이번 주 운세를 볼 수 있어요.
            </p>
            <button className="btn btn-gold" onClick={() => navigate('/')}>
              식사 기록하러 가기
            </button>
          </div>
        ) : (
          <>
            <div className="panel panel-cream-alt center-col" style={{ gap: 4 }}>
              <span className="pill pill-gold">이번 주 주제</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--purple-dark)', marginTop: 4 }}>
                {theme.title}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', textAlign: 'center' }}>{data.summary_text}</p>
            </div>

            {data.findings.length > 0 && (
              <div className="panel panel-navy">
                <h2 className="section-title">이번 주 흐름</h2>
                <ul className="bullet-list">
                  {data.findings.map((f) => (
                    <li key={f.tag} className="bullet-item">
                      <span className="bullet-dot" />
                      <span>
                        {f.message} <span style={{ opacity: 0.6 }}>· 주 {f.frequency}회</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.findings.length > 0 && (
              <div className="panel panel-navy">
                <h2 className="section-title">주의할 수 있는 컨디션</h2>
                <div className="food-grid">
                  {data.findings.slice(0, 3).map((f) => (
                    <div key={f.tag} className="food-cell">
                      <ConditionGhost type={conditionGhostType(f.predicted_symptom)} size={58} />
                      {f.predicted_symptom}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="panel panel-navy">
              <h2 className="section-title">이번 주 추천 습관</h2>
              <ul className="bullet-list">
                {(data.findings.length > 0
                  ? [...new Set(data.findings.map((f) => TAG_TIP[f.tag] || DEFAULT_TIP))]
                  : [DEFAULT_TIP]
                ).map((tip) => (
                  <li key={tip} className="check-item">
                    <span style={{ color: 'var(--green-tag)', fontWeight: 700 }}>✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel panel-cream center-col">
              <p style={{ fontStyle: 'italic', fontWeight: 700, color: 'var(--purple-dark)', textAlign: 'center' }}>
                “건강한 습관이 최고의 운세를 만들어요!”
              </p>
            </div>
          </>
        )}
      </ScreenBody>

      <BottomNav />
    </Screen>
  );
}