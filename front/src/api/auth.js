import { apiClient } from './client';

// POST /api/v1/auth/signup
export async function signup({ schoolCode, grade, classNo, nickname, password }) {
  const { data } = await apiClient.post('/auth/signup', {
    school_code: schoolCode,
    grade,
    class_no: classNo,
    nickname,
    password,
  });
  return data;
}

// POST /api/v1/auth/login -> {access_token, user_id, ...}
export async function login({ nickname, password }) {
  const { data } = await apiClient.post('/auth/login', { nickname, password });
  return data;
}