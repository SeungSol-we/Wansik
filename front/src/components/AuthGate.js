import { useEffect, useState } from 'react';
import { Screen, ScreenBody } from './layout/Screen';
import { SchoolSearchField } from './SchoolSearchField';
import { Mascot } from './Mascot';
import { useUserStore } from '../store/useUserStore';
import { loginAccount, signupAccount, hydrateAuthFromStore } from '../api/authSession';

const inputStyle = {
  display: 'block',
  width: '100%',
  marginTop: 4,
  border: '1.5px solid var(--cream-border-strong)',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 14,
};
const labelStyle = { fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' };

function LoginForm({ onSwitchToSignup }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await loginAccount({ loginId: loginId.trim(), password });
    } catch (err) {
      setError(err?.message || '로그인에 실패했어요. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = loginId.trim() && password && !submitting;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="panel panel-cream" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={labelStyle}>
          아이디
          <input value={loginId} onChange={(e) => setLoginId(e.target.value)} style={inputStyle} autoComplete="username" />
        </label>
        <label style={labelStyle}>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete="current-password"
          />
        </label>
      </div>

      {error && <div className="status-banner warn">{error}</div>}

      <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit}>
        {submitting ? '로그인하는 중…' : '로그인'}
      </button>
      <button type="button" className="link-quiet" style={{ alignSelf: 'center' }} onClick={onSwitchToSignup}>
        계정이 없으신가요? 회원가입
      </button>
    </form>
  );
}

function SignupForm({ onSwitchToLogin }) {
  const [nickname, setNickname] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [school, setSchool] = useState(null);
  const [grade, setGrade] = useState(1);
  const [classNo, setClassNo] = useState(1);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // backend/app/schemas/auth.py — login_id 4~50자, password 8~100자.
  const idTooShort = loginId.length > 0 && loginId.trim().length < 4;
  const pwTooShort = password.length > 0 && password.length < 8;
  const pwMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  const canSubmit =
    nickname.trim() &&
    loginId.trim().length >= 4 &&
    password.length >= 8 &&
    password === passwordConfirm &&
    school &&
    grade &&
    classNo &&
    consent &&
    !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await signupAccount({
        loginId: loginId.trim(),
        password,
        nickname: nickname.trim(),
        schoolCode: school.school_code,
        schoolName: school.school_name,
        grade: Number(grade),
        classNo: Number(classNo),
        guardianConsent: consent,
      });
    } catch (err) {
      setError(err?.message || '회원가입에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="panel panel-cream" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={labelStyle}>
          닉네임
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          아이디
          <input value={loginId} onChange={(e) => setLoginId(e.target.value)} style={inputStyle} autoComplete="username" />
          {idTooShort && <span style={{ fontSize: 11.5, color: 'var(--red-tag)' }}>아이디는 4자 이상이어야 해요.</span>}
        </label>
        <label style={labelStyle}>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete="new-password"
          />
          {pwTooShort && <span style={{ fontSize: 11.5, color: 'var(--red-tag)' }}>비밀번호는 8자 이상이어야 해요.</span>}
        </label>
        <label style={labelStyle}>
          비밀번호 확인
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            style={inputStyle}
            autoComplete="new-password"
          />
          {pwMismatch && <span style={{ fontSize: 11.5, color: 'var(--red-tag)' }}>비밀번호가 서로 달라요.</span>}
        </label>
      </div>

      <div className="panel panel-cream" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ ...labelStyle, display: 'block', marginBottom: 4 }}>학교</label>
          <SchoolSearchField selected={school} onSelect={setSchool} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <label style={{ flex: 1, ...labelStyle }}>
            학년
            <input type="number" min={1} max={3} value={grade} onChange={(e) => setGrade(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ flex: 1, ...labelStyle }}>
            반
            <input type="number" min={1} value={classNo} onChange={(e) => setClassNo(e.target.value)} style={inputStyle} />
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
        {submitting ? '가입하는 중…' : '회원가입'}
      </button>
      <button type="button" className="link-quiet" style={{ alignSelf: 'center' }} onClick={onSwitchToLogin}>
        이미 계정이 있으신가요? 로그인
      </button>
    </form>
  );
}

export function AuthGate({ children }) {
  const accessToken = useUserStore((s) => s.accessToken);
  const [mode, setMode] = useState('login');

  useEffect(() => {
    hydrateAuthFromStore();
  }, []);

  // This form stays mounted across a logout (only `accessToken` flips), so
  // without this a logout right after using the signup form would leave the
  // next visitor stuck looking at the signup screen instead of login.
  useEffect(() => {
    if (!accessToken) setMode('login');
  }, [accessToken]);

  if (accessToken) return children;

  return (
    <Screen theme="light">
      <div style={{ padding: '24px 20px 4px' }}>
        <div className="arch-frame center-col" style={{ maxWidth: 220, padding: '20px 20px 12px' }}>
          <Mascot type="calm" size={110} />
        </div>
        <h1 className="page-title" style={{ marginTop: 12, textAlign: 'center' }}>
          {mode === 'login' ? '로그인' : '회원가입'}
        </h1>
        <p className="page-subtitle">
          {mode === 'login' ? '식습관 운세를 보려면 로그인해주세요' : '몇 가지만 알려주시면 바로 시작할 수 있어요'}
        </p>
      </div>
      <ScreenBody>
        {mode === 'login' ? (
          <LoginForm onSwitchToSignup={() => setMode('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => setMode('login')} />
        )}
      </ScreenBody>
    </Screen>
  );
}