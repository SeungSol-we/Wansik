import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen, ScreenBody } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { useCreateManualMeal } from '../hooks/useMeals';

const MEAL_TYPES = [
  { value: 'breakfast', label: '아침' },
  { value: 'lunch', label: '점심' },
  { value: 'dinner', label: '저녁' },
  { value: 'snack', label: '간식' },
];

let nextId = 1;

export default function ManualEntryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialMealType = location.state?.mealType || 'snack';
  const fromFailedRecognition = location.state?.reason === 'AI_SERVICE_UNAVAILABLE';

  const [mealType, setMealType] = useState(initialMealType);
  const [items, setItems] = useState([{ id: nextId++, name: '', amount: '1인분' }]);
  const createManualMeal = useCreateManualMeal();

  const updateItem = (id, patch) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () => setItems((prev) => [...prev, { id: nextId++, name: '', amount: '1인분' }]);
  const removeItem = (id) => setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));

  const validItems = items.filter((it) => it.name.trim().length > 0);

  const handleSubmit = async () => {
    const meal = await createManualMeal.mutateAsync({
      mealType,
      eatenAt: new Date().toISOString(),
      items: validItems.map((it) => ({ food_name_raw: it.name.trim(), amount: it.amount })),
    });
    navigate(`/meals/${meal?.meal_id || meal?.id || 'demo-meal'}/guide`);
  };

  return (
    <Screen theme="light">
      <PageHeader title="직접 입력하기" />
      <ScreenBody>
        {fromFailedRecognition && (
          <div className="status-banner info">사진 인식이 잠시 어려웠어요. 대신 이름으로 기록해볼까요?</div>
        )}

        <div className="panel panel-cream-alt">
          <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>언제 먹은 음식인가요?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MEAL_TYPES.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`pill ${mealType === m.value ? 'pill-gold' : 'pill-outline'}`}
                onClick={() => setMealType(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="panel panel-cream">
          <h2 className="section-title">먹은 음식</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((it) => (
              <div key={it.id} style={{ display: 'flex', gap: 8 }}>
                <input
                  value={it.name}
                  placeholder="음식 이름 (예: 떡볶이)"
                  onChange={(e) => updateItem(it.id, { name: e.target.value })}
                  style={{ flex: 2, border: '1.5px solid var(--cream-border-strong)', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}
                />
                <input
                  value={it.amount}
                  placeholder="양"
                  onChange={(e) => updateItem(it.id, { amount: e.target.value })}
                  style={{ flex: 1, border: '1.5px solid var(--cream-border-strong)', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}
                />
                <button type="button" className="tap-target" onClick={() => removeItem(it.id)} aria-label="삭제" style={{ color: 'var(--red-tag)', fontSize: 18, padding: '0 6px' }}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <button className="btn btn-outline btn-block btn-sm" style={{ marginTop: 12 }} onClick={addItem}>
            + 음식 추가
          </button>
        </div>

        <button className="btn btn-primary btn-block" disabled={validItems.length === 0 || createManualMeal.isPending} onClick={handleSubmit}>
          {createManualMeal.isPending ? '저장하는 중…' : '기록 완료'}
        </button>
      </ScreenBody>
    </Screen>
  );
}