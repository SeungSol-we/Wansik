import { apiClient } from './client';

// GET /api/v1/school-meals?school_code=&date= -> {available, meal_type, items[]}
export async function fetchSchoolMeal({ schoolCode, date }) {
  const { data } = await apiClient.get('/school-meals', {
    params: { school_code: schoolCode, date },
  });
  return data;
}

// POST /api/v1/meals/from-school-meal {user_id,date,meal_type} -> meal (with guide)
export async function createMealFromSchoolMeal({ userId, date, mealType }) {
  const { data } = await apiClient.post('/meals/from-school-meal', {
    user_id: userId,
    date,
    meal_type: mealType,
  });
  return data;
}

// PATCH /api/v1/meals/{meal_id}/skip {reason}
export async function skipMeal({ mealId, reason }) {
  const { data } = await apiClient.patch(`/meals/${mealId}/skip`, { reason });
  return data;
}