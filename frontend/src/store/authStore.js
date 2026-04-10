import { create } from "zustand";
import {
  api,
  clearApiToken,
  extractResponseData,
  setApiToken,
} from "../lib/api.js";

const ACCESS_KEY = "vv_access_token";
const REFRESH_KEY = "vv_refresh_token";

const saveTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_KEY, accessToken);
    setApiToken(accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
};

const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  clearApiToken();
};

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem(ACCESS_KEY) || "",
  refreshToken: localStorage.getItem(REFRESH_KEY) || "",
  isAuthLoading: false,

  bootstrapAuth: async () => {
    const accessToken = localStorage.getItem(ACCESS_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);

    if (!accessToken && !refreshToken) {
      return;
    }

    set({ isAuthLoading: true });

    try {
      if (accessToken) {
        setApiToken(accessToken);
      }

      const profileResponse = await api.get("/api/v1/users/current-user");
      const user = extractResponseData(profileResponse);
      set({
        user,
        accessToken: accessToken || "",
        refreshToken: refreshToken || "",
      });
    } catch (error) {
      if (refreshToken) {
        try {
          const refreshResponse = await api.post(
            "/api/v1/users/refresh-token",
            {
              refreshToken,
            }
          );
          const tokens = extractResponseData(refreshResponse);
          saveTokens(tokens.accessToken, tokens.refreshToken);

          const profileResponse = await api.get("/api/v1/users/current-user");
          const user = extractResponseData(profileResponse);
          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });
          return;
        } catch (refreshError) {
          clearTokens();
          set({ user: null, accessToken: "", refreshToken: "" });
        }
      } else {
        clearTokens();
        set({ user: null, accessToken: "", refreshToken: "" });
      }
    } finally {
      set({ isAuthLoading: false });
    }
  },

  login: async ({ identifier, password }) => {
    set({ isAuthLoading: true });

    try {
      const payload = identifier.includes("@")
        ? { email: identifier, password }
        : { username: identifier, password };

      const response = await api.post("/api/v1/users/login", payload);
      const data = extractResponseData(response);
      saveTokens(data.accessToken, data.refreshToken);

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error?.response?.data?.message || "Unable to login",
      };
    } finally {
      set({ isAuthLoading: false });
    }
  },

  register: async ({ fullname, username, email, password }) => {
    set({ isAuthLoading: true });

    try {
      await api.post("/api/v1/users/register", {
        fullname,
        username,
        email,
        password,
      });

      return await get().login({ identifier: email, password });
    } catch (error) {
      return {
        ok: false,
        message: error?.response?.data?.message || "Unable to register",
      };
    } finally {
      set({ isAuthLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/api/v1/users/logout");
    } catch (error) {
      // Ignore API logout failures and always clear local client state.
    }

    clearTokens();
    set({ user: null, accessToken: "", refreshToken: "" });
  },

  isAuthenticated: () => Boolean(get().user && get().accessToken),
}));
