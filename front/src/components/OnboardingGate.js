import { useEffect, useState } from 'react';
import { Screen, ScreenBody } from './layout/Screen';
import { FortuneGhost } from '../assets/illustrations/GhostMascot';
import { useUserStore } from '../store/useUserStore';
import { bootstrapNewAccount, hydrateAuthFromStore } from '../api/authSession';

// Gates the app behind a minimal one-time setup step. The backend requires a
// real account (login_id/password) before any endpoint works, but the product
// scope (기획서 §3) doesn't include signup/login screens yet — so instead of a
// username/password form, we just ask for the profile fields the backend
// needs (닉네임/학교/학년/반 + 보호자 동의) and create a device-local account
// behind the scenes. Swap this for a real onboarding flow once designed.
export function OnboardingGate({ children }) {
  const { accessToken, nickname: storedNickname, schoolCode: storedSchoolCode, grade: storedGrade, classNo: storedClassNo } = useUserStore();
  const [ready, setReady] = useState(Boolean(accessToken));
  const [nickname, setNickname] = useState(storedNickname);
  const [schoolCode, setSchoolCode] = useState(storedSchoolCode);
  const [grade, setGrade] = useState(storedGrade);
  const [classNo, setClassNo] = useState(storedClassNo);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    hydrateAuthFromStore();
  }, []);

  if (ready) return children;

  const canSubmit = nickname.trim() && schoolCode.trim() && grade && classNo && consent && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await bootstrapNewAccount({
        nickname: nickname.trim(),
        schoolCode: schoolCode.trim(),
        grade: Number(grade),
        classNo: Number(classNo),
        guardianConsent: consent,
      });
      setReady(true);
    } catch (err) {
      setError(err?.message || '계정을 만들지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen theme="light">
      <div style={{ padding: '32px 20px 4px' }} className="center-col">
        <FortuneGhost size={110} />
        <h1 className="page-title" style={{ marginTop: 8 }}>시작하기 전에</h1>
        <p className="page-subtitle">식습관 운세를 보려면 몇 가지만 알려주세요</p>
      </div>
      <ScreenBody>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="panel panel-cream" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>
              닉네임
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: 4, border: '1.5px solid var(--cream-border-strong)', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}
              />
            </label>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>
              학교 코드
              <input
                value={schoolCode}
                placeholder="예: SC12345"
                onChange={(e) => setSchoolCode(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: 4, border: '1.5px solid var(--cream-border-strong)', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}
              />
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <label style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>
                학년
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  style={{ display: 'block', width: '100%', marginTop: 4, border: '1.5px solid var(--cream-border-strong)', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}
                />
              </label>
              <label style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>
                반
                <input
                  type="number"
                  min={1}
                  value={classNo}
                  onChange={(e) => setClassNo(e.target.value)}
                  style={{ display: 'block', width: '100%', marginTop: 4, border: '1.5px solid var(--cream-border-strong)', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}
                />
              </label>
            </div>
          </div>

          <label className="panel panel-cream-alt" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
            <span>
              만 14세 미만인 경우 보호자의 동의가 필요해요. 보호자의 동의를 받았다면 체크해주세요.
              이 앱의 안내는 의료 자문을 대체하지 않아요.
            </span>
          </label>

          {error && <div className="status-banner warn">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit}>
            {submitting ? '준비하는 중…' : '시작하기'}
          </button>
        </form>
      </ScreenBody>
    </Screen>
  );
}