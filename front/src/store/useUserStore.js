import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Real account state backed by backend/app/routers/auth.py (login_id/password,
// signup/login/me). No password is ever stored client-side — the 60-minute
// access token (backend/app/core/security.py) is persisted so a page reload
// doesn't force a re-login, but once it expires the user just logs in again.
const INITIAL_STATE = {
  accessToken: null,
  userId: null,
  loginId: null,

  nickname: '',
  schoolCode: '',
  schoolName: '',
  grade: 1,
  classNo: 1,
};

export const useUserStore = create(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setAuth: ({ accessToken, userId }) => set({ accessToken, userId }),
      setProfile: (partial) => set(partial),
      logout: () => set({ ...INITIAL_STATE }),
    }),
    { name: 'diet-care-user' }
  )
);