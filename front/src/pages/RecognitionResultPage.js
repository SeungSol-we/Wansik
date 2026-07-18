import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen, ScreenBody } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { useConfirmPhotoMeal } from '../hooks/useMeals';

export default function RecognitionResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, mealType, previewUrl } = location.state || {};
  const confirmPhotoMeal = useConfirmPhotoMeal();

  const [candidates, setCandidates] = useState(() =>
    (result?.candidates || []).map((c, i) => ({
      id: i,
      name: c.food_name_raw,
      confidence: c.confidence,
      lowConfidence: c.low_confidence,
      matchedFoodId: c.matched_food_id,
      included: true,
    }))
  );

  useEffect(() => {
    if (!result) {
      navigate('/capture', { replace: true });
    }
  }, [result, navigate]);

  if (!result) return null;

  const toggleIncluded = (id) =>
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, included: !c.included } : c)));

  const updateName = (id, name) =>
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, name, lowConfidence: false } : c)));

  const handleConfirm = async () => {
    const items = candidates
      .filter((c) => c.included)
      .map((c) => ({ matched_food_id: c.matchedFoodId, food_name_raw: c.name, amount: '1인분' }));
    const meal = await confirmPhotoMeal.mutateAsync({
      mealType,
      eatenAt: new Date().toISOString(),
      items,
    });
    navigate(`/meals/${meal._id}/guide`);
  };

  const noCandidates = candidates.length === 0;
  const includedCount = candidates.filter((c) => c.included).length;

  return (
    <Screen theme="light">
      <PageHeader title="인식 결과 확인" />
      <ScreenBody>
        {previewUrl && (
          <img src={previewUrl} alt="촬영한 음식" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 16 }} />
        )}

        {noCandidates ? (
          <div className="panel panel-cream center-col" style={{ gap: 12, padding: 28 }}>
            <p style={{ fontWeight: 700 }}>이 사진은 알아보기 어려웠어요</p>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', textAlign: 'center' }}>
              괜찮아요, 대신 직접 입력해볼까요?
            </p>
            <button className="btn btn-primary btn-block" onClick={() => navigate('/manual-entry', { state: { mealType } })}>
              직접 입력하기
            </button>
          </div>
        ) : (
          <>
            <div className="panel panel-cream">
              <h2 className="section-title">이 음식이 맞나요?</h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {candidates.map((c) => (
                  <li
                    key={c.id}
                    className="row-item"
                    style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8, borderTop: 'none', paddingTop: 0 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" checked={c.included} onChange={() => toggleIncluded(c.id)} />
                      <input
                        value={c.name}
                        onChange={(e) => updateName(c.id, e.target.value)}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          border: '1.5px solid var(--cream-border-strong)',
                          borderRadius: 10,
                          padding: '8px 10px',
                          fontSize: 14,
                          background: c.included ? 'var(--white)' : 'transparent',
                        }}
                      />
                    </div>
                    {c.lowConfidence && (
                      <span className="status-banner warn" style={{ alignSelf: 'flex-start' }}>
                        확신이 낮아요 · 이름을 확인해주세요
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="btn btn-primary btn-block"
              disabled={includedCount === 0 || confirmPhotoMeal.isPending}
              onClick={handleConfirm}
            >
              {confirmPhotoMeal.isPending ? '저장하는 중…' : `이대로 기록하기 (${includedCount})`}
            </button>
            <button className="link-quiet" style={{ alignSelf: 'center' }} onClick={() => navigate('/manual-entry', { state: { mealType } })}>
              직접 입력할래요
            </button>
          </>
        )}
      </ScreenBody>
    </Screen>
  );
}