import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Phase 1 ships without a signup/login screen yet (see 기획서 §3 화면 범위),
// so we keep a locally-persisted demo identity to pass as user_id / school_code
// on every API call. Swap this out once the auth screens land.
function makeDemoId() {
  return 'demo-' + Math.random().toString(36).slice(2, 10);
}

export const useUserStore = create(
  persist(
    (set) => ({
      userId: makeDemoId(),
      nickname: '식습관러',
      schoolCode: '',
      grade: 1,
      classNo: 1,
      setProfile: (partial) => set(partial),
    }),
    { name: 'diet-care-user' }
  )
);