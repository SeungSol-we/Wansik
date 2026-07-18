import { apiClient } from './client';

// POST /api/v1/meals/photo-recognition (multipart, field name "file")
// -> {recognition_status, candidates[], fallback_required}
export async function recognizePhoto({ file }) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post('/meals/photo-recognition', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// POST /api/v1/meals/photo-recognition/confirm
export async function confirmPhotoRecognition({ mealType, eatenAt, photoUrl, items }) {
  const { data } = await apiClient.post('/meals/photo-recognition/confirm', {
    meal_type: mealType,
    eaten_at: eatenAt,
    photo_url: photoUrl,
    items,
  });
  return data;
}

// POST /api/v1/meals/manual {meal_type, eaten_at, items[]}
export async function createManualMeal({ mealType, eatenAt, items }) {
  const { data } = await apiClient.post('/meals/manual', {
    meal_type: mealType,
    eaten_at: eatenAt,
    items,
  });
  return data;
}

// GET /api/v1/meals/{meal_id}/guide -> {meal_id, cautions[]}
export async function fetchMealGuide({ mealId }) {
  const { data } = await apiClient.get(`/meals/${mealId}/guide`);
  return data;
}

// GET /api/v1/meals/{meal_id}/eating-order -> {meal_id, eating_order: string[], unclassified: string[]}
export async function fetchEatingOrder({ mealId }) {
  const { data } = await apiClient.get(`/meals/${mealId}/eating-order`);
  return data;
}