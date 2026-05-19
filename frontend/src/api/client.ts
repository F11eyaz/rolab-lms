import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// Public API
export const companyApi = {
  get: () => api.get('/company'),
};

export const teachersApi = {
  list: () => api.get('/teachers'),
  get: (id: string) => api.get(`/teachers/${id}`),
};

export const categoriesApi = {
  list: () => api.get('/categories'),
};

export const coursesApi = {
  list: (params?: Record<string, unknown>) => api.get('/courses', { params }),
  get: (id: string) => api.get(`/courses/${id}`),
  getReviews: (id: string) => api.get(`/courses/${id}/reviews`),
};

export const programsApi = {
  get: (id: string) => api.get(`/programs/${id}`),
  submitReview: (id: string, data: unknown) => api.post(`/programs/${id}/reviews`, data),
};

export const lessonsApi = {
  get: (id: string) => api.get(`/lessons/${id}`),
};

// Admin API
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: unknown) => api.post('/admin/auth/register', data),
};

export const adminApi = {
  // Company
  updateCompany: (data: unknown) => api.put('/admin/company', data),
  // Teachers
  listTeachers: () => api.get('/admin/teachers'),
  createTeacher: (data: unknown) => api.post('/admin/teachers', data),
  updateTeacher: (id: string, data: unknown) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id: string) => api.delete(`/admin/teachers/${id}`),
  // Categories
  listCategories: () => api.get('/admin/categories'),
  createCategory: (data: unknown) => api.post('/admin/categories', data),
  updateCategory: (id: number, data: unknown) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),
  // Courses
  listCourses: () => api.get('/admin/courses'),
  createCourse: (data: unknown) => api.post('/admin/courses', data),
  updateCourse: (id: string, data: unknown) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/admin/courses/${id}`),
  // Programs
  listPrograms: () => api.get('/admin/programs'),
  createProgram: (data: unknown) => api.post('/admin/programs', data),
  updateProgram: (id: string, data: unknown) => api.put(`/admin/programs/${id}`, data),
  deleteProgram: (id: string) => api.delete(`/admin/programs/${id}`),
  // Lessons
  listLessons: () => api.get('/admin/lessons'),
  createLesson: (data: unknown) => api.post('/admin/lessons', data),
  updateLesson: (id: string, data: unknown) => api.put(`/admin/lessons/${id}`, data),
  deleteLesson: (id: string) => api.delete(`/admin/lessons/${id}`),
  // Reviews
  listReviews: () => api.get('/admin/reviews'),
  approveReview: (id: string) => api.put(`/admin/reviews/${id}/approve`),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
  // Upload
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/admin/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
