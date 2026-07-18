import { useQuery } from '@tanstack/react-query';
import { fetchWeeklyReport } from '../api/analysis';
import { useUserStore } from '../store/useUserStore';

export function useWeeklyReport(periodStart) {
  const userId = useUserStore((s) => s.userId);
  return useQuery({
    queryKey: ['weekly-report', userId, periodStart],
    queryFn: () =>
      fetchWeeklyReport({ userId, periodStart }).catch((err) => {
        // No meals logged in this window yet — a real empty state, not a bug.
        if (err.error_code === 'REPORT_NOT_FOUND') return null;
        throw err;
      }),
    enabled: Boolean(userId),
  });
}