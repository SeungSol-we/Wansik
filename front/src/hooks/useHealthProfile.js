import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchHealthProfile, saveHealthProfile } from '../api/healthProfile';
import { useUserStore } from '../store/useUserStore';

const EMPTY_PROFILE = { allergies: [], diet_type: 'NONE', conditions: [] };

export function useHealthProfile() {
  const userId = useUserStore((s) => s.userId);
  return useQuery({
    queryKey: ['health-profile', userId],
    queryFn: () =>
      fetchHealthProfile({ userId }).catch((err) => {
        // Not an error from the user's point of view — they just haven't
        // filled out a profile yet.
        if (err.error_code === 'HEALTH_PROFILE_NOT_SET') return EMPTY_PROFILE;
        throw err;
      }),
    enabled: Boolean(userId),
  });
}

export function useSaveHealthProfile() {
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.userId);
  return useMutation({
    mutationFn: ({ allergies, dietType, conditions }) => saveHealthProfile({ userId, allergies, dietType, conditions }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['health-profile', userId] }),
  });
}