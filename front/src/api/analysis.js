import { apiClient } from './client';

// POST /api/v1/analysis/weekly/generate {user_id,period_start,period_end}
export async function generateWeeklyReport({ userId, periodStart, periodEnd }) {
  const { data } = await apiClient.post('/analysis/weekly/generate', {
    user_id: userId,
    period_start: periodStart,
    period_end: periodEnd,
  });
  return data;
}

// GET /api/v1/analysis/weekly?user_id=&period_start=
export async function fetchWeeklyReport({ userId, periodStart }) {
  const { data } = await apiClient.get('/analysis/weekly', {
    params: { user_id: userId, period_start: periodStart },
  });
  return data;
}