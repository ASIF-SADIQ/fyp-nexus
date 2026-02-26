import axios from 'axios';

const BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://fyp-teamup-api.vercel.app/api'; 

const api = axios.create({
  baseURL: BASE_URL,
});

// 1. Request Interceptor (Attach Token)
api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 2. Response Interceptor (Handle 401s and Errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Clearing local storage and redirecting to login...");
      localStorage.removeItem('userInfo');
      // Optional: window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

// ==========================================
// PROJECT WORKFLOW APIs
// ==========================================

// 1. Student: Submit project for final supervisor review
export const submitProjectForReview = (projectId) => api.put(`/projects/${projectId}/submit-for-review`);

// 2. Supervisor: Request changes/revision from students
export const requestProjectRevision = (projectId, data) => api.put(`/projects/${projectId}/request-revision`, data);

// 3. Supervisor: Give final grade and automatically mark as complete
export const submitProjectGrade = (projectId, gradeData) => api.put(`/projects/${projectId}/grade-project`, gradeData);

export default api;