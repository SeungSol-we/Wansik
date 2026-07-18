import { apiClient } from './client';

// GET /api/v1/analysis/weekly?user_id=&period_start=
// Generates the report on-demand server-side if it doesn't exist yet
// (see backend/app/services/analysis_service.py:get_weekly_report), but
// still 404s with REPORT_NOT_FOUND when the user has zero meals in range.
export async function fetchWeeklyReport({ userId, periodStart }) {
  const { data } = await apiClient.get('/analysis/weekly', {
    params: { user_id: userId, period_start: periodStart },
  });
  return data;
}