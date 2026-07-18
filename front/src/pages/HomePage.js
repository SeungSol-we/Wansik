import { useNavigate } from 'react-router-dom';
import { Screen, ScreenBody } from '../components/layout/Screen';
import { BottomNav } from '../components/layout/BottomNav';
import { Mascot } from '../components/Mascot';
import { FoodRecommendationGrid } from '../components/FoodRecommendationGrid';
import { useUserStore } from '../store/useUserStore';
import { useWeeklyReport } from '../hooks/useWeeklyReport';
import { getRecommendationForTag } from '../data/foodRecommendations';
import { getFortuneMessage } from '../data/fortuneMessages';
import { mondayOfThisWeek } from '../utils/date';
import styles from './HomePage.module.css';

const FORTUNE_MASCOT = {
  stomach_ache: 'sad',
  bloating: 'sad',
  skin_trouble: 'sadAlt',
  puffy_face: 'sadAlt',
  general_caution: 'thinking',
  balanced: 'cheer',
};

export default function HomePage() {
  const navigate = useNavigate();
  const nickname = useUserStore((s) => s.nickname);
  // "오늘의 운세"는 백엔드에 일일 요약 엔드포인트가 없어(주간 리포트만 존재),
  // 이번 주 실제 식사 기록의 findings(backend/app/services/analysis_service.py)를
  // 그대로 활용한다 — 기록이 쌓일수록, 그리고 무엇을 먹었는지에 따라 달라진다.
  const { data: weeklyReport } = useWeeklyReport(mondayOfThisWeek());
  const findings = weeklyReport?.findings || [];
  const topTag = findings[0]?.tag;
  const recommendedFoods = getRecommendationForTag(topTag);
  const fortune = getFortuneMessage(weeklyReport?.illustration_key);
  const fortuneMascot = FORTUNE_MASCOT[weeklyReport?.illustration_key] || 'thinking';

  return (
    <Screen theme="light">
      <div className={styles.heroWrap}>
        <p className="eyebrow">{nickname}님을 위한</p>
        <h1 className="page-title">오늘의 식습관 운세</h1>
        <p className="page-subtitle">오늘의 컨디션을 확인해보세요!</p>

        <div className="arch-frame center-col">
          <Mascot type="calm" size={170} className="float" />
        </div>
      </div>

      <ScreenBody>
        <div className={styles.quickActions}>
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/school-meal')}>
            오늘 급식 확인하기
          </button>
          <div className={styles.quickRow}>
            <button type="button" className="btn btn-outline btn-block btn-sm" onClick={() => navigate('/capture')}>
              사진으로 기록
            </button>
            <button type="button" className="btn btn-outline btn-block btn-sm" onClick={() => navigate('/manual-entry')}>
              직접 입력
            </button>
          </div>
        </div>

        <div className="panel panel-cream">
          <h2 className="section-title">이번 주 운세</h2>
          <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 16, color: 'var(--purple-dark)' }}>
            {fortune.title}
          </p>
          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, whiteSpace: 'pre-line', marginTop: 6 }}>
            {fortune.desc}
          </p>
          <div className="center-col" style={{ margin: '10px 0' }}>
            <Mascot type={fortuneMascot} size={110} />
          </div>

          {findings.length > 0 && (
            <>
              <div className="divider" />
              <h3 style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
                이번 주 식습관 요약
              </h3>
              <ul>
                {findings.slice(0, 3).map((f) => (
                  <li key={f.tag} className="row-item">
                    <span className="row-label">{f.tag}</span>
                    <span className="pill pill-red">주 {f.frequency}회</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="divider" />
          <h3 style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
            오늘의 추천
          </h3>
          <FoodRecommendationGrid items={recommendedFoods} />
        </div>
      </ScreenBody>

      <BottomNav />
    </Screen>
  );
}