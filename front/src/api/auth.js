import { apiClient } from './client';

// POST /api/v1/auth/signup -> {access_token, token_type, user_id}
export async function signup({ loginId, password, schoolCode, schoolName, grade, classNo, nickname, guardianConsent }) {
  const { data } = await apiClient.post('/auth/signup', {
    login_id: loginId,
    password,
    school_code: schoolCode,
    school_name: schoolName,
    grade,
    class_no: classNo,
    nickname,
    guardian_consent: guardianConsent,
  });
  return data;
}

// POST /api/v1/auth/login -> {access_token, token_type, user_id}
export async function login({ loginId, password }) {
  const { data } = await apiClient.post('/auth/login', { login_id: loginId, password });
  return data;
}

// GET /api/v1/auth/me -> {user_id, login_id, nickname, school_code, school_name, grade, class_no}
export async function getMe() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}