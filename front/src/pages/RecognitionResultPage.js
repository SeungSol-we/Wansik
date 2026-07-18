import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen, ScreenBody } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { Mascot } from '../components/Mascot';
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

  // If the user corrects the recognized name, the AI's original food match no
  // longer applies — clear it so the backend re-resolves by the new name
  // (see meal_service.confirm_photo_meal's fallback matching).
  const updateName = (id, name) =>
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, name, lowConfidence: false, matchedFoodId: null } : c)));

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
            <Mascot type="thinking" size={100} />
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
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center', marginTop: -6, marginBottom: 4 }}>
                이름이 틀렸다면 눌러서 고치고, 뺄 음식은 제외해주세요
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {candidates.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 14,
                      border: `1.5px solid ${c.included ? 'var(--cream-border-strong)' : 'var(--cream-border)'}`,
                      background: c.included ? 'var(--white)' : 'var(--cream-panel-alt)',
                      opacity: c.included ? 1 : 0.55,
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: 'var(--cream-panel-alt)',
                        border: '1.5px solid var(--cream-border-strong)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M6 3v8a2 2 0 0 0 2 2v8M6 3v6M8 3v6" stroke="var(--purple-primary)" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M17 3c-1.5 0-3 1.5-3 4s1 4 1 4v8" stroke="var(--purple-primary)" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input
                        value={c.name}
                        onChange={(e) => updateName(c.id, e.target.value)}
                        disabled={!c.included}
                        style={{
                          width: '100%',
                          border: 'none',
                          borderBottom: '1.5px solid transparent',
                          background: 'transparent',
                          padding: '2px 0',
                          fontSize: 14.5,
                          fontWeight: 700,
                          color: 'var(--ink)',
                        }}
                        onFocus={(e) => (e.target.style.borderBottomColor = 'var(--purple-primary-soft)')}
                        onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
                      />
                      {c.lowConfidence && c.included && (
                        <span className="pill pill-red" style={{ marginTop: 4, fontSize: 11, padding: '2px 8px' }}>
                          확신이 낮아요 · 이름을 확인해주세요
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="tap-target"
                      onClick={() => toggleIncluded(c.id)}
                      aria-label={c.included ? '제외하기' : '다시 포함하기'}
                      style={{
                        flexShrink: 0,
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1.5px solid ${c.included ? 'var(--red-tag)' : 'var(--green-tag)'}`,
                        color: c.included ? 'var(--red-tag)' : 'var(--green-tag)',
                        fontSize: 16,
                        lineHeight: 1,
                      }}
                    >
                      {c.included ? '×' : '+'}
                    </button>
                  </div>
                ))}
              </div>
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