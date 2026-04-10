import { create } from "zustand";

const randomId = () => Math.random().toString(36).slice(2, 10);

export const useAppStore = create((set) => ({
  videos: [],
  recommendations: [],
  activeMood: "All",
  adaptiveGlow: "#9D4EDD",
  watchAnalytics: {
    totalMinutes: 0,
    streakDays: 1,
    completionRate: 0,
  },
  toasts: [],

  setVideos: (videosOrUpdater) =>
    set((state) => ({
      videos:
        typeof videosOrUpdater === "function"
          ? videosOrUpdater(state.videos)
          : videosOrUpdater,
    })),
  setRecommendations: (recommendations) => set({ recommendations }),
  setActiveMood: (activeMood) => set({ activeMood }),
  setAdaptiveGlow: (adaptiveGlow) => set({ adaptiveGlow }),
  updateWatchAnalytics: (minutesWatched) =>
    set((state) => {
      const totalMinutes = state.watchAnalytics.totalMinutes + minutesWatched;
      const completionRate = Math.min(
        100,
        Math.round((totalMinutes / 180) * 100)
      );

      return {
        watchAnalytics: {
          ...state.watchAnalytics,
          totalMinutes,
          completionRate,
        },
      };
    }),
  addToast: (type, message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: randomId(), type, message }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
