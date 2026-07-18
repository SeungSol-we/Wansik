import { useEffect, useState } from 'react';
import { Screen, ScreenBody } from '../components/layout/Screen';
import { BottomNav } from '../components/layout/BottomNav';
import { useHealthProfile, useSaveHealthProfile } from '../hooks/useHealthProfile';
import { useUserStore } from '../store/useUserStore';

const ALLERGY_OPTIONS = ['땅콩', '새우', '계란', '우유', '밀', '대두', '갑각류', '고등어', '복숭아'];
const CONDITION_OPTIONS = ['비염', '아토피', '위염', '천식', '당뇨'];
// backend/app/models/health_profile.py — NONE/VEGETARIAN/HALAL 세 가지뿐.
const DIET_TYPES = [
  { value: 'NONE', label: '제한 없음' },
  { value: 'VEGETARIAN', label: '채식' },
  { value: 'HALAL', label: '할랄' },
];

function ChipToggleGroup({ options, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`pill ${selected.includes(opt) ? 'pill-gold' : 'pill-outline'}`}
          onClick={() => onToggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function HealthProfilePage() {
  const { nickname, schoolName, grade, classNo } = useUserStore();
  const { data, isLoading } = useHealthProfile();
  const saveProfile = useSaveHealthProfile();

  const [allergies, setAllergies] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [dietType, setDietType] = useState('NONE');
  const [customAllergy, setCustomAllergy] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setAllergies(data.allergies || []);
      setConditions(data.conditions || []);
      setDietType(data.diet_type || 'NONE');
    }
  }, [data]);

  const toggleAllergy = (v) =>
    setAllergies((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  const toggleCondition = (v) =>
    setConditions((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const addCustomAllergy = () => {
    const v = customAllergy.trim();
    if (v && !allergies.includes(v)) setAllergies((prev) => [...prev, v]);
    setCustomAllergy('');
  };

  const handleSave = async () => {
    await saveProfile.mutateAsync({ allergies, dietType, conditions });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Screen theme="light">
      <div style={{ padding: '18px 20px 4px' }}>
        <p className="eyebrow">나의 정보</p>
        <h1 className="page-title">건강 프로필</h1>
        <p className="page-subtitle">정확한 가이드를 위해 알려주세요. 의료 자문을 대체하지 않아요.</p>
      </div>

      <ScreenBody>
        <div className="panel panel-cream">
          <h2 className="section-title">기본 정보</h2>
          {/* 가입(온보딩) 시 한 번만 입력되는 정보 — 서버에 수정 API가 없어
              여기서는 조회만 가능하다 (backend/app/routers 에 계정 정보
              수정 엔드포인트가 아직 없음). */}
          <ul>
            <li className="row-item">
              <span className="row-label">닉네임</span>
              <span>{nickname}</span>
            </li>
            <li className="row-item">
              <span className="row-label">학교</span>
              <span>{schoolName || '-'}</span>
            </li>
            <li className="row-item">
              <span className="row-label">학년 / 반</span>
              <span>{grade}학년 {classNo}반</span>
            </li>
          </ul>
        </div>

        <div className="panel panel-cream">
          <h2 className="section-title">알레르기</h2>
          {isLoading ? (
            <p className="eyebrow">불러오는 중…</p>
          ) : (
            <>
              <ChipToggleGroup options={ALLERGY_OPTIONS} selected={allergies} onToggle={toggleAllergy} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input
                  value={customAllergy}
                  placeholder="직접 입력"
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomAllergy()}
                  style={{ flex: 1, border: '1.5px solid var(--cream-border-strong)', borderRadius: 10, padding: '8px 12px', fontSize: 13 }}
                />
                <button type="button" className="btn btn-outline btn-sm" onClick={addCustomAllergy}>
                  추가
                </button>
              </div>
            </>
          )}
        </div>

        <div className="panel panel-cream">
          <h2 className="section-title">식습관 유형</h2>
          <ChipToggleGroup
            options={DIET_TYPES.map((d) => d.label)}
            selected={[DIET_TYPES.find((d) => d.value === dietType)?.label]}
            onToggle={(label) => setDietType(DIET_TYPES.find((d) => d.label === label)?.value || 'NONE')}
          />
        </div>

        <div className="panel panel-cream">
          <h2 className="section-title">건강 상태 / 지병</h2>
          <ChipToggleGroup options={CONDITION_OPTIONS} selected={conditions} onToggle={toggleCondition} />
        </div>

        <button className="btn btn-primary btn-block" disabled={saveProfile.isPending} onClick={handleSave}>
          {saveProfile.isPending ? '저장하는 중…' : saved ? '저장 완료!' : '저장하기'}
        </button>
      </ScreenBody>

      <BottomNav />
    </Screen>
  );
}