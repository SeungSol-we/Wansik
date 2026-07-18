import { Screen, ScreenBody } from '../components/layout/Screen';
import { BottomNav } from '../components/layout/BottomNav';
import { CrystalBallGhost, ConditionGhost } from '../assets/illustrations/GhostMascot';
import { MoonStars, StringLights } from '../assets/illustrations/Decorations';
import { useWeeklyReport } from '../hooks/useWeeklyReport';

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
  const { data, isLoading } = useWeeklyReport(mondayOfThisWeek());

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
        ) : (
          <>
            <div className="panel panel-cream-alt center-col" style={{ gap: 4 }}>
              <span className="pill pill-gold">이번 주 주제</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--purple-dark)', marginTop: 4 }}>
                {data.theme_title}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{data.theme_subtitle}</p>
            </div>

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

            <div className="panel panel-navy">
              <h2 className="section-title">주의할 수 있는 컨디션</h2>
              <div className="food-grid">
                {data.watch_conditions.map((c) => (
                  <div key={c.label} className="food-cell">
                    <ConditionGhost type={c.type} size={58} />
                    {c.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel panel-navy">
              <h2 className="section-title">이번 주 추천 습관</h2>
              <ul className="bullet-list">
                {data.recommended_habits.map((habit) => (
                  <li key={habit} className="check-item">
                    <span style={{ color: 'var(--green-tag)', fontWeight: 700 }}>✓</span>
                    <span>{habit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel panel-cream center-col">
              <p style={{ fontStyle: 'italic', fontWeight: 700, color: 'var(--purple-dark)', textAlign: 'center' }}>
                “{data.quote}”
              </p>
            </div>
          </>
        )}
      </ScreenBody>

      <BottomNav />
    </Screen>
  );
}