import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const ROOT_BASE = API_BASE.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

// Must be called once before login/register/logout so Laravel issues a CSRF cookie
export async function ensureCsrfCookie() {
  await axios.get(`${ROOT_BASE}/sanctum/csrf-cookie`, { withCredentials: true });
}

api.interceptors.request.use((config) => {
  const xsrfToken = getCookie("XSRF-TOKEN");
  if (xsrfToken) config.headers["X-XSRF-TOKEN"] = xsrfToken;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;