import { useNavigate } from 'react-router-dom';
import { Screen, ScreenBody } from '../components/layout/Screen';
import { BottomNav } from '../components/layout/BottomNav';
import { FortuneGhost, HurtingGhost } from '../assets/illustrations/GhostMascot';
import { FoodIcon } from '../assets/illustrations/FoodIcon';
import { TODAY_SUMMARY } from '../api/mockData';
import { useUserStore } from '../store/useUserStore';
import styles from './HomePage.module.css';

const MINI_ICONS = [
  <path key="stomach" d="M9 3 C5 3 3 7 4 11 C4.6 13.4 7 15 9 15 C11 15 13.4 13.4 14 11 C15 7 13 3 9 3 Z" fill="#e2603a" />,
  <path key="moon" d="M12 3 A7 7 0 1 0 12 15 A5.6 5.6 0 1 1 12 3 Z" fill="#8879c4" />,
  <g key="smiley">
    <circle cx="9" cy="9" r="6.5" fill="none" stroke="#d9a441" strokeWidth="1.4" />
    <circle cx="6.6" cy="7.4" r="1" fill="#d9a441" />
    <circle cx="11.4" cy="7.4" r="1" fill="#d9a441" />
    <path d="M6 10.5 Q9 13 12 10.5" stroke="#d9a441" strokeWidth="1.3" fill="none" strokeLinecap="round" />
  </g>,
  <path
    key="heart"
    d="M9 15 C3 11 2 7.5 4.3 5.4 C6 3.8 8.2 4.4 9 6.2 C9.8 4.4 12 3.8 13.7 5.4 C16 7.5 15 11 9 15 Z"
    fill="#e2603a"
  />,
];

export default function HomePage() {
  const navigate = useNavigate();
  const nickname = useUserStore((s) => s.nickname);

  return (
    <Screen theme="light">
      <div className={styles.heroWrap}>
        <p className="eyebrow">{nickname}님을 위한</p>
        <h1 className="page-title">오늘의 식습관 운세</h1>
        <p className="page-subtitle">오늘의 컨디션을 확인해보세요!</p>

        <div className="arch-frame center-col" style={{ position: 'relative' }}>
          <FortuneGhost size={128} className="float" />
          <div className={styles.tableRow}>
            {MINI_ICONS.map((icon, i) => (
              <div key={i} className={styles.miniCard}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  {icon}
                </svg>
              </div>
            ))}
          </div>
          <div className={styles.crystalDot} />
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
          <h2 className="section-title">오늘의 운세</h2>
          <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 16, color: 'var(--purple-dark)' }}>
            {TODAY_SUMMARY.fortune_title}
          </p>
          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, whiteSpace: 'pre-line', marginTop: 6 }}>
            {TODAY_SUMMARY.fortune_desc}
          </p>
          <div className="center-col" style={{ margin: '10px 0' }}>
            <HurtingGhost size={120} />
          </div>

          <div className="divider" />
          <h3 style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
            오늘의 식습관 요약
          </h3>
          <ul>
            {TODAY_SUMMARY.habit_summary.map((row) => (
              <li key={row.label} className="row-item">
                <span className="row-label">{row.label}</span>
                <span className={`pill pill-${row.tone}`}>{row.value}</span>
              </li>
            ))}
          </ul>

          <div className="divider" />
          <h3 style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
            오늘의 추천
          </h3>
          <div className="food-grid">
            {TODAY_SUMMARY.recommended_foods.map((f) => (
              <div key={f.label} className="food-cell">
                <div className="food-icon-badge">
                  <FoodIcon type={f.type} size={30} />
                </div>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </ScreenBody>

      <BottomNav />
    </Screen>
  );
}