import { apiClient } from './client';

// GET /api/v1/schools/search?keyword= -> {results:[{school_code, school_name, school_level, region, address}]}
// Public endpoint (no auth) — used during onboarding before an account exists.
export async function searchSchools({ keyword }) {
  const { data } = await apiClient.get('/schools/search', { params: { keyword } });
  return data.results;
}