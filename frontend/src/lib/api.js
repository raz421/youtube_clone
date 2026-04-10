import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const ACCESS_KEY = "vv_access_token";
const REFRESH_KEY = "vv_refresh_token";

let inMemoryAccessToken = localStorage.getItem(ACCESS_KEY) || "";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const setApiToken = (token) => {
  inMemoryAccessToken = token || "";
};

export const clearApiToken = () => {
  inMemoryAccessToken = "";
};

api.interceptors.request.use((config) => {
  const token = inMemoryAccessToken || localStorage.getItem(ACCESS_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const statusCode = error?.response?.status;
    const isAuthRefreshCall = originalRequest.url?.includes("/refresh-token");

    if (statusCode !== 401 || originalRequest._retry || isAuthRefreshCall) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      localStorage.removeItem(ACCESS_KEY);
      clearApiToken();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/api/v1/users/refresh-token`,
        { refreshToken },
        { withCredentials: true }
      );

      const tokenData = refreshResponse?.data?.data;
      const nextAccessToken = tokenData?.accessToken;
      const nextRefreshToken = tokenData?.refreshToken;

      if (!nextAccessToken) {
        throw new Error("Missing refreshed access token");
      }

      localStorage.setItem(ACCESS_KEY, nextAccessToken);
      setApiToken(nextAccessToken);
      if (nextRefreshToken) {
        localStorage.setItem(REFRESH_KEY, nextRefreshToken);
      }

      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      clearApiToken();
      return Promise.reject(refreshError);
    }
  }
);

export const extractResponseData = (response) => {
  if (!response?.data) {
    return null;
  }

  return response.data.data ?? response.data;
};
