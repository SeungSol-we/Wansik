import { login as apiLogin, signup as apiSignup } from './auth';
import { setAuthToken, setAuthExpiredHandler } from './client';
import { useUserStore } from '../store/useUserStore';

function randomCredentials() {
  const loginId = 'dev_' + Math.random().toString(36).slice(2, 10);
  const password = Math.random().toString(36).slice(2, 10) + 'Aa1!';
  return { loginId, password };
}

// No refresh-token flow on this backend (60-minute access token — see
// backend/app/core/security.py), so on a 401 we silently re-login with the
// device account's stored credentials and retry the original request.
export async function relogin() {
  const { loginId, password } = useUserStore.getState();
  if (!loginId || !password) {
    throw new Error('no stored device account credentials');
  }
  const data = await apiLogin({ loginId, password });
  useUserStore.getState().setAuth({ accessToken: data.access_token, userId: data.user_id });
  setAuthToken(data.access_token);
  return data;
}

export async function bootstrapNewAccount({ nickname, schoolCode, schoolName, grade, classNo, guardianConsent }) {
  const { loginId, password } = randomCredentials();
  const data = await apiSignup({ loginId, password, schoolCode, grade, classNo, nickname, guardianConsent });
  useUserStore.getState().setAccount({ loginId, password });
  useUserStore.getState().setAuth({ accessToken: data.access_token, userId: data.user_id });
  useUserStore.getState().setProfile({ nickname, schoolCode, schoolName, grade, classNo });
  setAuthToken(data.access_token);
  return data;
}

// Called once on app start: re-attaches a persisted token to the axios
// client (the in-memory token in client.js doesn't survive a page reload)
// and wires up the silent-relogin handler for 401s.
export function hydrateAuthFromStore() {
  const { accessToken } = useUserStore.getState();
  if (accessToken) setAuthToken(accessToken);
  setAuthExpiredHandler(relogin);
}