import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// The backend (backend/app/routers/auth.py) requires a real login_id/password
// account — there's no separate signup/login screen in the 8-screen scope yet
// (see 기획서 §3), so OnboardingGate creates a device-local account once
// (random login_id/password the user never sees or types) and stores it here
// so we can silently re-login when the 60-minute access token expires
// (backend has no refresh-token flow — see backend/app/core/security.py).
export const useUserStore = create(
  persist(
    (set) => ({
      accessToken: null,
      userId: null,
      loginId: null,
      password: null,

      nickname: '식습관러',
      schoolCode: '',
      grade: 1,
      classNo: 1,

      setAuth: ({ accessToken, userId }) => set({ accessToken, userId }),
      setAccount: ({ loginId, password }) => set({ loginId, password }),
      setProfile: (partial) => set(partial),
      logout: () => set({ accessToken: null, userId: null, loginId: null, password: null }),
    }),
    { name: 'diet-care-user' }
  )
);