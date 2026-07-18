import { apiClient } from './client';

// GET /api/v1/school-meals?school_code=&date=&meal_type= -> {available, meal_type, items[]}
export async function fetchSchoolMeal({ schoolCode, date, mealType = 'LUNCH' }) {
  const { data } = await apiClient.get('/school-meals', {
    params: { school_code: schoolCode, date, meal_type: mealType },
  });
  return data;
}

// POST /api/v1/meals/from-school-meal {date, meal_type} -> meal (current user, from token)
export async function createMealFromSchoolMeal({ date, mealType }) {
  const { data } = await apiClient.post('/meals/from-school-meal', {
    date,
    meal_type: mealType,
  });
  return data;
}

// PATCH /api/v1/meals/{meal_id}/skip {reason} -> 204 No Content
export async function skipMeal({ mealId, reason }) {
  await apiClient.patch(`/meals/${mealId}/skip`, { reason });
}