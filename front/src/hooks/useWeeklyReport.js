import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWeeklyReport, generateWeeklyReport } from '../api/analysis';
import { withFallback } from '../api/withFallback';
import { MOCK_WEEKLY_REPORT } from '../api/mockData';
import { useUserStore } from '../store/useUserStore';

export function useWeeklyReport(periodStart) {
  const userId = useUserStore((s) => s.userId);
  return useQuery({
    queryKey: ['weekly-report', userId, periodStart],
    queryFn: () => withFallback(fetchWeeklyReport({ userId, periodStart }), MOCK_WEEKLY_REPORT),
    enabled: Boolean(userId),
  });
}

export function useGenerateWeeklyReport() {
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.userId);
  return useMutation({
    mutationFn: ({ periodStart, periodEnd }) => generateWeeklyReport({ userId, periodStart, periodEnd }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weekly-report', userId] }),
  });
}