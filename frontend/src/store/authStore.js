import { create } from "zustand";
import {
  api,
  clearApiToken,
  extractResponseData,
  setApiToken,
} from "../lib/api.js";
import { endpoints } from "../lib/endpoints.js";
import { useAppStore } from "./appStore.js";

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

  isAdmin: () => get().user?.role === "admin",
  isUser: () => get().user?.role !== "admin",

  bootstrapAuth: async () => {
    const hydrateUserLibrary = useAppStore.getState().hydrateUserLibrary;
    const clearUserLibrary = useAppStore.getState().clearUserLibrary;
    const accessToken = localStorage.getItem(ACCESS_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);

    if (!accessToken && !refreshToken) {
      clearUserLibrary();
      return;
    }

    set({ isAuthLoading: true });

    try {
      if (accessToken) {
        setApiToken(accessToken);
      }

      const profileResponse = await api.get(endpoints.users.currentUser);
      const user = extractResponseData(profileResponse);
      hydrateUserLibrary(user?._id);
      set({
        user,
        accessToken: accessToken || "",
        refreshToken: refreshToken || "",
      });
    } catch (error) {
      if (refreshToken) {
        try {
          const refreshResponse = await api.post(endpoints.users.refreshToken, {
            refreshToken,
          });
          const tokens = extractResponseData(refreshResponse);
          saveTokens(tokens.accessToken, tokens.refreshToken);

          const profileResponse = await api.get(endpoints.users.currentUser);
          const user = extractResponseData(profileResponse);
          hydrateUserLibrary(user?._id);
          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });
          return;
        } catch (refreshError) {
          clearTokens();
          clearUserLibrary();
          set({ user: null, accessToken: "", refreshToken: "" });
        }
      } else {
        clearTokens();
        clearUserLibrary();
        set({ user: null, accessToken: "", refreshToken: "" });
      }
    } finally {
      set({ isAuthLoading: false });
    }
  },

  login: async ({ identifier, password }) => {
    const hydrateUserLibrary = useAppStore.getState().hydrateUserLibrary;
    set({ isAuthLoading: true });

    try {
      const payload = identifier.includes("@")
        ? { email: identifier, password }
        : { username: identifier, password };

      const response = await api.post(endpoints.users.login, payload);
      const data = extractResponseData(response);
      saveTokens(data.accessToken, data.refreshToken);

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      hydrateUserLibrary(data?.user?._id);

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
      await api.post(endpoints.users.register, {
        fullname,
        username,
        email,
        password,
      });
      return {
        ok: true,
        message: "Account created. Please sign in.",
      };
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
    const clearUserLibrary = useAppStore.getState().clearUserLibrary;
    try {
      await api.post(endpoints.users.logout);
    } catch (error) {
      // Ignore API logout failures and always clear local client state.
    }

    clearTokens();
    clearUserLibrary();
    set({ user: null, accessToken: "", refreshToken: "" });
  },

  refreshUser: async () => {
    const hydrateUserLibrary = useAppStore.getState().hydrateUserLibrary;
    try {
      const profileResponse = await api.get(endpoints.users.currentUser);
      const user = extractResponseData(profileResponse);
      hydrateUserLibrary(user?._id);
      set({ user });
      return { ok: true, user };
    } catch (error) {
      return {
        ok: false,
        message: error?.response?.data?.message || "Unable to refresh user",
      };
    }
  },

  patchUser: (partialUser) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partialUser } : partialUser,
    })),

  isAuthenticated: () => Boolean(get().user && get().accessToken),
}));
