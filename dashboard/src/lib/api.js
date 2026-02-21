import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const session = localStorage.getItem("ragit_session");

  if (session) {
    const parsed = JSON.parse(session);
    config.headers.Authorization = `Bearer ${parsed.access_token}`;
  }

  return config;
});

// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ragit_session");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;