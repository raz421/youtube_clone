import { create } from "zustand";

const randomId = () => Math.random().toString(36).slice(2, 10);
const STORAGE_KEY = "vv_user_library";

const getStoredLibrary = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        watchHistory: [],
        likedVideos: [],
        watchLater: [],
        downloadedVideos: [],
        dislikedVideos: [],
        likedComments: [],
      };
    }

    const parsed = JSON.parse(raw);
    return {
      watchHistory: Array.isArray(parsed.watchHistory)
        ? parsed.watchHistory
        : [],
      likedVideos: Array.isArray(parsed.likedVideos) ? parsed.likedVideos : [],
      watchLater: Array.isArray(parsed.watchLater) ? parsed.watchLater : [],
      downloadedVideos: Array.isArray(parsed.downloadedVideos)
        ? parsed.downloadedVideos
        : [],
      dislikedVideos: Array.isArray(parsed.dislikedVideos)
        ? parsed.dislikedVideos
        : [],
      likedComments: Array.isArray(parsed.likedComments)
        ? parsed.likedComments
        : [],
    };
  } catch (_error) {
    return {
      watchHistory: [],
      likedVideos: [],
      watchLater: [],
      downloadedVideos: [],
      dislikedVideos: [],
      likedComments: [],
    };
  }
};

const persistLibrary = (state) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      watchHistory: state.watchHistory,
      likedVideos: state.likedVideos,
      watchLater: state.watchLater,
      downloadedVideos: state.downloadedVideos,
      dislikedVideos: state.dislikedVideos,
      likedComments: state.likedComments,
    })
  );
};

const initialLibrary = getStoredLibrary();

export const useAppStore = create((set) => ({
  videos: [],
  recommendations: [],
  activeMood: "All",
  activeLibraryView: "all",
  adaptiveGlow: "#9D4EDD",
  watchAnalytics: {
    totalMinutes: 0,
    streakDays: 1,
    completionRate: 0,
  },
  watchHistory: initialLibrary.watchHistory,
  likedVideos: initialLibrary.likedVideos,
  watchLater: initialLibrary.watchLater,
  downloadedVideos: initialLibrary.downloadedVideos,
  dislikedVideos: initialLibrary.dislikedVideos,
  likedComments: initialLibrary.likedComments,
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
  setActiveLibraryView: (activeLibraryView) => set({ activeLibraryView }),
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
  trackWatchHistory: (video) =>
    set((state) => {
      const videoId = video?.id || video?._id;
      if (!videoId) {
        return state;
      }

      const deduped = state.watchHistory.filter(
        (item) => (item.id || item._id) !== videoId
      );
      const nextState = {
        ...state,
        watchHistory: [{ ...video, _seenAt: Date.now() }, ...deduped].slice(
          0,
          30
        ),
      };
      persistLibrary(nextState);
      return nextState;
    }),
  toggleWatchLater: (video) =>
    set((state) => {
      const videoId = video?.id || video?._id;
      if (!videoId) {
        return state;
      }

      const exists = state.watchLater.some(
        (item) => (item.id || item._id) === videoId
      );
      const nextState = {
        ...state,
        watchLater: exists
          ? state.watchLater.filter((item) => (item.id || item._id) !== videoId)
          : [{ ...video, _savedAt: Date.now() }, ...state.watchLater],
      };
      persistLibrary(nextState);
      return nextState;
    }),
  toggleLikedVideo: (video) =>
    set((state) => {
      const videoId = video?.id || video?._id;
      if (!videoId) {
        return state;
      }

      const exists = state.likedVideos.some(
        (item) => (item.id || item._id) === videoId
      );
      const nextState = {
        ...state,
        likedVideos: exists
          ? state.likedVideos.filter(
              (item) => (item.id || item._id) !== videoId
            )
          : [{ ...video, _likedAt: Date.now() }, ...state.likedVideos],
        dislikedVideos: state.dislikedVideos.filter(
          (item) => (item.id || item._id) !== videoId
        ),
      };
      persistLibrary(nextState);
      return nextState;
    }),
  toggleDislikedVideo: (video) =>
    set((state) => {
      const videoId = video?.id || video?._id;
      if (!videoId) {
        return state;
      }

      const exists = state.dislikedVideos.some(
        (item) => (item.id || item._id) === videoId
      );
      const nextState = {
        ...state,
        dislikedVideos: exists
          ? state.dislikedVideos.filter(
              (item) => (item.id || item._id) !== videoId
            )
          : [{ ...video, _dislikedAt: Date.now() }, ...state.dislikedVideos],
        likedVideos: state.likedVideos.filter(
          (item) => (item.id || item._id) !== videoId
        ),
      };
      persistLibrary(nextState);
      return nextState;
    }),
  toggleLikedComment: (commentId) =>
    set((state) => {
      if (!commentId) {
        return state;
      }

      const exists = state.likedComments.includes(commentId);
      const nextState = {
        ...state,
        likedComments: exists
          ? state.likedComments.filter((id) => id !== commentId)
          : [commentId, ...state.likedComments],
      };
      persistLibrary(nextState);
      return nextState;
    }),
  addDownloadedVideo: (video) =>
    set((state) => {
      const videoId = video?.id || video?._id;
      if (!videoId) {
        return state;
      }

      const exists = state.downloadedVideos.some(
        (item) => (item.id || item._id) === videoId
      );

      if (exists) {
        return state;
      }

      const nextState = {
        ...state,
        downloadedVideos: [
          { ...video, _downloadedAt: Date.now() },
          ...state.downloadedVideos,
        ].slice(0, 100),
      };

      persistLibrary(nextState);
      return nextState;
    }),
  removeDownloadedVideo: (videoId) =>
    set((state) => {
      if (!videoId) {
        return state;
      }

      const nextState = {
        ...state,
        downloadedVideos: state.downloadedVideos.filter(
          (item) => (item.id || item._id) !== videoId
        ),
      };

      persistLibrary(nextState);
      return nextState;
    }),
  removeVideoFromLibrary: (videoId) =>
    set((state) => {
      if (!videoId) {
        return state;
      }

      const nextState = {
        ...state,
        videos: state.videos.filter(
          (item) => (item.id || item._id) !== videoId
        ),
        recommendations: state.recommendations.filter(
          (item) => (item.id || item._id) !== videoId
        ),
        watchHistory: state.watchHistory.filter(
          (item) => (item.id || item._id) !== videoId
        ),
        likedVideos: state.likedVideos.filter(
          (item) => (item.id || item._id) !== videoId
        ),
        watchLater: state.watchLater.filter(
          (item) => (item.id || item._id) !== videoId
        ),
        downloadedVideos: state.downloadedVideos.filter(
          (item) => (item.id || item._id) !== videoId
        ),
        dislikedVideos: state.dislikedVideos.filter(
          (item) => (item.id || item._id) !== videoId
        ),
      };

      persistLibrary(nextState);
      return nextState;
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
