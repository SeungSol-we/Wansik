import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, ScreenBody } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { FoodIcon } from '../assets/illustrations/FoodIcon';
import { FortuneGhost } from '../assets/illustrations/GhostMascot';
import { useConfirmSchoolMeal, useSchoolMeal, useSkipMeal } from '../hooks/useSchoolMeal';

const FOOD_ICON_BY_INDEX = ['soup', 'rice', 'vegetable', 'fruit', 'porridge'];
const SKIP_REASONS = ['오늘은 급식을 안 먹었어요', '다른 음식을 먹었어요', '식사를 걸렀어요'];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function SchoolMealPage() {
  const navigate = useNavigate();
  const [reasonOpen, setReasonOpen] = useState(false);
  const date = todayISO();
  const { data, isLoading } = useSchoolMeal(date);
  const confirmMeal = useConfirmSchoolMeal();
  const skipMeal = useSkipMeal();

  const handleEaten = async () => {
    const meal = await confirmMeal.mutateAsync({ date, mealType: 'lunch' });
    navigate(`/meals/${meal?.meal_id || meal?.id || 'demo-meal'}/guide`);
  };

  const handleSkip = async (reason) => {
    await skipMeal.mutateAsync({ mealId: 'today-lunch', reason }).catch(() => {});
    navigate('/');
  };

  return (
    <Screen theme="light">
      <PageHeader title="오늘의 급식" />
      <ScreenBody>
        <p className="page-subtitle">{date} · 점심</p>

        {isLoading ? (
          <div className="panel panel-cream center-col" style={{ padding: 40 }}>
            <span>급식 정보를 불러오는 중…</span>
          </div>
        ) : !data?.available ? (
          <div className="panel panel-cream center-col" style={{ gap: 14, padding: 28 }}>
            <FortuneGhost size={110} />
            <p style={{ textAlign: 'center', fontWeight: 700 }}>오늘은 급식이 없어요</p>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
              방학이거나 급식이 제공되지 않는 날일 수 있어요.
              <br />
              드신 음식을 기록해볼까요?
            </p>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button className="btn btn-outline btn-block" onClick={() => navigate('/capture')}>
                사진으로 기록
              </button>
              <button className="btn btn-primary btn-block" onClick={() => navigate('/manual-entry')}>
                직접 입력
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="panel panel-cream">
              <h2 className="section-title">오늘의 메뉴</h2>
              <ul>
                {data.items.map((item, i) => (
                  <li key={item.food_id || item.name} className="row-item">
                    <span className="row-label">
                      <span className="food-icon-badge" style={{ width: 36, height: 36 }}>
                        <FoodIcon type={FOOD_ICON_BY_INDEX[i % FOOD_ICON_BY_INDEX.length]} size={20} />
                      </span>
                      {item.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {!reasonOpen ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline btn-block" onClick={() => setReasonOpen(true)}>
                  오늘은 안 먹음
                </button>
                <button className="btn btn-primary btn-block" disabled={confirmMeal.isPending} onClick={handleEaten}>
                  {confirmMeal.isPending ? '기록 중…' : '먹었어요'}
                </button>
              </div>
            ) : (
              <div className="panel panel-cream-alt">
                <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>어떤 상황이었나요?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {SKIP_REASONS.map((reason) => (
                    <button key={reason} className="btn btn-outline" onClick={() => handleSkip(reason)}>
                      {reason}
                    </button>
                  ))}
                </div>
                <button className="link-quiet" style={{ marginTop: 8 }} onClick={() => setReasonOpen(false)}>
                  취소
                </button>
              </div>
            )}
          </>
        )}
      </ScreenBody>
    </Screen>
  );
}