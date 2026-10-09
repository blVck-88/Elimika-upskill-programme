// API base URL — reads from env or defaults to localhost in dev
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getHeaders = (auth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = localStorage.getItem('elimika_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(err.detail || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
};

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data) =>
    fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(data),
    }).then(handleResponse),

  login: (email, password) => {
    const form = new URLSearchParams({ username: email, password });
    return fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    }).then(handleResponse);
  },

  me: () =>
    fetch(`${BASE_URL}/api/auth/me`, { headers: getHeaders() }).then(handleResponse),
};

// ─── Courses ───────────────────────────────────────────────────────────────

export const coursesApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return fetch(`${BASE_URL}/api/courses${qs ? '?' + qs : ''}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  myCourses: () =>
    fetch(`${BASE_URL}/api/courses/my-courses`, { headers: getHeaders() }).then(handleResponse),

  get: (id) =>
    fetch(`${BASE_URL}/api/courses/${id}`, { headers: getHeaders() }).then(handleResponse),

  create: (data) =>
    fetch(`${BASE_URL}/api/courses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`${BASE_URL}/api/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${BASE_URL}/api/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  addLesson: (courseId, data) =>
    fetch(`${BASE_URL}/api/courses/${courseId}/lessons`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
};

// ─── Enrollments ──────────────────────────────────────────────────────────

export const enrollmentsApi = {
  enroll: (course_id) =>
    fetch(`${BASE_URL}/api/enrollments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ course_id }),
    }).then(handleResponse),

  myEnrollments: () =>
    fetch(`${BASE_URL}/api/enrollments/my`, { headers: getHeaders() }).then(handleResponse),

  updateProgress: (enrollmentId, progress) =>
    fetch(`${BASE_URL}/api/enrollments/${enrollmentId}/progress?progress=${progress}`, {
      method: 'PUT',
      headers: getHeaders(),
    }).then(handleResponse),
};

// ─── Dashboard ────────────────────────────────────────────────────────────

export const dashboardApi = {
  stats: () =>
    fetch(`${BASE_URL}/api/dashboard/stats`, { headers: getHeaders() }).then(handleResponse),
};

// ─── Exams ────────────────────────────────────────────────────────────────

export const examsApi = {
  forCourse: (courseId) =>
    fetch(`${BASE_URL}/api/exams/course/${courseId}`, { headers: getHeaders() }).then(handleResponse),

  get: (examId) =>
    fetch(`${BASE_URL}/api/exams/${examId}`, { headers: getHeaders() }).then(handleResponse),

  create: (courseId, data) =>
    fetch(`${BASE_URL}/api/exams?course_id=${courseId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  submit: (data) =>
    fetch(`${BASE_URL}/api/exams/attempt`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
};
