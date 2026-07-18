import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, ScreenBody } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { useRecognizePhoto } from '../hooks/useMeals';

const MEAL_TYPES = [
  { value: 'BREAKFAST', label: '아침' },
  { value: 'LUNCH', label: '점심/급식 외' },
  { value: 'DINNER', label: '저녁' },
  { value: 'SNACK', label: '간식' },
];

export default function PhotoCapturePage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mealType, setMealType] = useState('SNACK');
  const recognize = useRecognizePhoto();

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) return;
    try {
      // mealType isn't sent here — recognition only classifies the food in
      // the photo; meal_type is attached later at confirm time.
      const result = await recognize.mutateAsync({ file });
      navigate('/recognition', { state: { result, mealType, previewUrl } });
    } catch (err) {
      navigate('/manual-entry', { state: { mealType, reason: 'AI_SERVICE_UNAVAILABLE' } });
    }
  };

  return (
    <Screen theme="light">
      <PageHeader title="사진으로 기록하기" />
      <ScreenBody>
        <p className="page-subtitle">방금 먹은 음식을 촬영하거나 갤러리에서 선택해주세요</p>

        <div className="panel panel-cream center-col" style={{ gap: 14, padding: previewUrl ? 12 : 32 }}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="선택한 음식 사진"
              style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 16 }}
            />
          ) : (
            <>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect x="6" y="16" width="44" height="32" rx="6" stroke="#b9aee0" strokeWidth="2.4" />
                <circle cx="28" cy="32" r="9" stroke="#b9aee0" strokeWidth="2.4" />
                <path d="M18 16 L21 10 H35 L38 16" stroke="#b9aee0" strokeWidth="2.4" strokeLinejoin="round" />
              </svg>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>사진이 아직 없어요</p>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          <button className="btn btn-outline btn-block" onClick={() => inputRef.current?.click()}>
            {previewUrl ? '다시 촬영 / 다른 사진 선택' : '촬영 또는 사진 선택'}
          </button>
        </div>

        <div className="panel panel-cream-alt">
          <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>언제 먹은 음식인가요?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MEAL_TYPES.map((m) => (
              <button
                key={m.value}
                className={`pill ${mealType === m.value ? 'pill-gold' : 'pill-outline'}`}
                onClick={() => setMealType(m.value)}
                type="button"
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-block" disabled={!file || recognize.isPending} onClick={handleSubmit}>
          {recognize.isPending ? '음식을 인식하는 중…' : '인식하기'}
        </button>
        <button className="link-quiet" style={{ alignSelf: 'center' }} onClick={() => navigate('/manual-entry', { state: { mealType } })}>
          사진 없이 직접 입력할래요
        </button>
      </ScreenBody>
    </Screen>
  );
}