import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchHealthProfile, saveHealthProfile } from '../api/healthProfile';
import { withFallback } from '../api/withFallback';
import { MOCK_HEALTH_PROFILE } from '../api/mockData';
import { useUserStore } from '../store/useUserStore';

export function useHealthProfile() {
  const userId = useUserStore((s) => s.userId);
  return useQuery({
    queryKey: ['health-profile', userId],
    queryFn: () => withFallback(fetchHealthProfile({ userId }), MOCK_HEALTH_PROFILE),
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