import { apiClient } from './client';

// GET /api/v1/users/{user_id}/health-profile
export async function fetchHealthProfile({ userId }) {
  const { data } = await apiClient.get(`/users/${userId}/health-profile`);
  return data;
}

// POST /api/v1/users/{user_id}/health-profile {allergies[],diet_type,conditions[]}
export async function saveHealthProfile({ userId, allergies, dietType, conditions }) {
  const { data } = await apiClient.post(`/users/${userId}/health-profile`, {
    allergies,
    diet_type: dietType,
    conditions,
  });
  return data;
}

// GET /api/v1/foods/{food_id}/caution?user_id=
export async function fetchFoodCaution({ foodId, userId }) {
  const { data } = await apiClient.get(`/foods/${foodId}/caution`, { params: { user_id: userId } });
  return data;
}