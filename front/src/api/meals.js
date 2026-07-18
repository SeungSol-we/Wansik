import { apiClient } from './client';

// POST /api/v1/meals/photo-recognition (multipart) -> {recognition_status, candidates[], fallback_required}
export async function recognizePhoto({ file, mealType }) {
  const form = new FormData();
  form.append('image', file);
  if (mealType) form.append('meal_type', mealType);
  const { data } = await apiClient.post('/meals/photo-recognition', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// POST /api/v1/meals/photo-recognition/confirm
export async function confirmPhotoRecognition({ userId, mealType, eatenAt, items }) {
  const { data } = await apiClient.post('/meals/photo-recognition/confirm', {
    user_id: userId,
    meal_type: mealType,
    eaten_at: eatenAt,
    items,
  });
  return data;
}

// POST /api/v1/meals/manual {user_id,meal_type,eaten_at,items[]}
export async function createManualMeal({ userId, mealType, eatenAt, items }) {
  const { data } = await apiClient.post('/meals/manual', {
    user_id: userId,
    meal_type: mealType,
    eaten_at: eatenAt,
    items,
  });
  return data;
}

// GET /api/v1/meals?user_id=&from=&to=
export async function fetchMeals({ userId, from, to }) {
  const { data } = await apiClient.get('/meals', { params: { user_id: userId, from, to } });
  return data;
}

export async function updateMeal({ mealId, payload }) {
  const { data } = await apiClient.put(`/meals/${mealId}`, payload);
  return data;
}

export async function deleteMeal({ mealId }) {
  const { data } = await apiClient.delete(`/meals/${mealId}`);
  return data;
}

// GET /api/v1/meals/{meal_id}/guide -> {cautions[], eating_order[]}
export async function fetchMealGuide({ mealId }) {
  const { data } = await apiClient.get(`/meals/${mealId}/guide`);
  return data;
}

// GET /api/v1/meals/{meal_id}/eating-order -> {order[], unclassified[]}
export async function fetchEatingOrder({ mealId }) {
  const { data } = await apiClient.get(`/meals/${mealId}/eating-order`);
  return data;
}