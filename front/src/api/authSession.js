import { login as apiLogin, signup as apiSignup, getMe } from './auth';
import { setAuthToken, setAuthExpiredHandler } from './client';
import { useUserStore } from '../store/useUserStore';

function applyProfile(me) {
  useUserStore.getState().setProfile({
    loginId: me.login_id,
    nickname: me.nickname,
    schoolCode: me.school_code,
    schoolName: me.school_name,
    grade: me.grade,
    classNo: me.class_no,
  });
}

export async function loginAccount({ loginId, password }) {
  const data = await apiLogin({ loginId, password });
  setAuthToken(data.access_token);
  useUserStore.getState().setAuth({ accessToken: data.access_token, userId: data.user_id });
  applyProfile(await getMe());
  return data;
}

export async function signupAccount({ loginId, password, nickname, schoolCode, schoolName, grade, classNo, guardianConsent }) {
  const data = await apiSignup({ loginId, password, nickname, schoolCode, schoolName, grade, classNo, guardianConsent });
  setAuthToken(data.access_token);
  useUserStore.getState().setAuth({ accessToken: data.access_token, userId: data.user_id });
  useUserStore.getState().setProfile({ loginId, nickname, schoolCode, schoolName, grade, classNo });
  return data;
}

export function logout() {
  useUserStore.getState().logout();
  setAuthToken(null);
}

// Called once on app start: re-attaches a persisted token to the axios
// client (the in-memory token in client.js doesn't survive a page reload),
// refreshes profile fields, and wires up the 401 handler. This backend has
// no refresh-token flow (60-minute access token — see
// backend/app/core/security.py), so an expired token just logs the user out
// and the real login screen takes it from there.
export function hydrateAuthFromStore() {
  const { accessToken } = useUserStore.getState();
  if (accessToken) {
    setAuthToken(accessToken);
    getMe().then(applyProfile).catch(() => logout());
  }
  setAuthExpiredHandler(async () => {
    logout();
  });
}