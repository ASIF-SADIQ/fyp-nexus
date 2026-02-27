import axios from "axios";

/*
  Production → Uses Vercel Environment Variable
  Local Dev → Falls back to localhost
*/

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ==========================================
// 1️⃣ Request Interceptor (Attach Token)
// ==========================================
api.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// 2️⃣ Response Interceptor (Handle 401s)
// ==========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Clearing local storage...");
      localStorage.removeItem("userInfo");
      // Optional redirect:
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ==========================================
// PROJECT WORKFLOW APIs
// ==========================================

// Student: Submit project for final supervisor review
export const submitProjectForReview = (projectId) =>
  api.put(`/projects/${projectId}/submit-for-review`);

// Supervisor: Request changes/revision
export const requestProjectRevision = (projectId, data) =>
  api.put(`/projects/${projectId}/request-revision`, data);

// Supervisor: Give final grade
export const submitProjectGrade = (projectId, gradeData) =>
  api.put(`/projects/${projectId}/grade-project`, gradeData);

export default api;