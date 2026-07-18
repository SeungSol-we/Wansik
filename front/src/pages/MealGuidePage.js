import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen, ScreenBody } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { TarotFrame, TarotCardBack } from '../assets/illustrations/TarotCard';
import { HurtingGhost, TinyWizardGhost } from '../assets/illustrations/GhostMascot';
import { MoonStars } from '../assets/illustrations/Decorations';
import { useEatingOrder, useMealGuide } from '../hooks/useMeals';

const SEVERITY_LABEL = { HIGH: '꼭 확인하세요', MEDIUM: '가볍게 참고하세요', LOW: '참고만 하세요' };

export default function MealGuidePage() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const { data: guide, isLoading: guideLoading, isError: guideError } = useMealGuide(mealId);
  const { data: orderData, isLoading: orderLoading } = useEatingOrder(mealId);
  const [pickedCard, setPickedCard] = useState(null);

  const isLoading = guideLoading || orderLoading;
  const cautions = guide?.cautions || [];
  // 백엔드 EatingOrderResponse.eating_order 는 음식 이름 문자열 배열이라
  // (카테고리 정보는 서버 정렬에만 쓰이고 응답에는 없음), 순서만 번호로 보여준다.
  const order = orderData?.eating_order || [];
  const unclassified = orderData?.unclassified || [];
  const primary = cautions[0];
  const hasHighAlert = cautions.some((c) => c.severity === 'HIGH');

  return (
    <Screen theme="dark">
      <MoonStars height={70} />
      <PageHeader title="식습관 타로" dark />
      <ScreenBody>
        {isLoading ? (
          <p className="eyebrow">가이드를 불러오는 중…</p>
        ) : guideError ? (
          <div className="status-banner warn">가이드를 불러오지 못했어요.</div>
        ) : cautions.length > 0 && pickedCard === null ? (
          <div className="center-col" style={{ gap: 20, padding: '18px 0 10px' }}>
            <p className="page-subtitle">카드를 선택하면 오늘의 식습관을 알려드려요</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              {[0, 1, 2].map((i) => (
                <TarotCardBack key={i} onClick={() => setPickedCard(i)} />
              ))}
            </div>
            <p className="eyebrow">카드를 선택해주세요</p>
          </div>
        ) : (
          <>
            {cautions.length === 0 ? (
              <div className="panel panel-navy center-col" style={{ gap: 10, padding: 28 }}>
                <TinyWizardGhost size={80} />
                <p style={{ fontWeight: 700 }}>특별히 주의할 점은 없어요</p>
                <p style={{ fontSize: 13, color: 'var(--cream-text-dim)', textAlign: 'center' }}>
                  오늘도 균형 잡힌 식사를 했어요. 잘하고 있어요!
                </p>
              </div>
            ) : (
              <>
                {hasHighAlert && (
                  <div className="status-banner warn">
                    알레르기 유발 성분이 포함되어 있어요. 꼭 확인해주세요!
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 12, alignItems: 'stretch' }}>
                  <TarotFrame label={primary.food_name}>
                    <HurtingGhost size={92} />
                  </TarotFrame>

                  <div className="panel panel-navy">
                    <p className="eyebrow" style={{ textAlign: 'left', marginBottom: 2 }}>오늘의 카드</p>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>
                      {primary.possible_symptom}
                    </h2>
                    <div className="divider" />
                    <p className="eyebrow" style={{ textAlign: 'left', marginBottom: 6 }}>키워드</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <span className="pill pill-outline">{primary.food_name}</span>
                      <span className="pill pill-outline">{SEVERITY_LABEL[primary.severity] || '참고'}</span>
                    </div>
                  </div>
                </div>

                <div className="panel panel-navy" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <TinyWizardGhost size={64} />
                  <div>
                    <p className="eyebrow" style={{ textAlign: 'left', marginBottom: 4 }}>오늘의 조언</p>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>{primary.recommendation}</p>
                  </div>
                </div>

                {cautions.length > 1 && (
                  <div className="panel panel-navy">
                    <h3 className="eyebrow" style={{ textAlign: 'left', marginBottom: 8 }}>더 확인해보세요</h3>
                    <ul>
                      {cautions.slice(1).map((c, i) => (
                        <li key={i} className="row-item">
                          <span className="row-label">{c.food_name}</span>
                          <span className="pill pill-outline">{c.possible_symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {order.length > 0 && (
              <div className="panel panel-cream">
                <h2 className="section-title">추천 섭취 순서</h2>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {order.map((foodName, i) => (
                    <li key={`${foodName}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'var(--purple-primary)',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{foodName}</span>
                    </li>
                  ))}
                </ul>
                {unclassified.length > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 10 }}>
                    분류 기준이 없는 음식: {unclassified.join(', ')}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <button className="btn btn-gold btn-block" onClick={() => navigate('/')}>
          확인했어요
        </button>
      </ScreenBody>
    </Screen>
  );
}