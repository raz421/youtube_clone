export const endpoints = {
  public: {
    videos: "/videos",
    videoDetails: (id) => `/videos/${id}`,
    recommendations: "/recommendations",
    search: "/search",
    upload: "/upload",
    analyticsWatch: "/analytics/watch",
    analyticsMe: "/analytics/me",
    postComment: "/comment",
    postLike: "/like",
  },
  users: {
    register: "/api/v1/users/register",
    login: "/api/v1/users/login",
    logout: "/api/v1/users/logout",
    refreshToken: "/api/v1/users/refresh-token",
    currentUser: "/api/v1/users/current-user",
    changePassword: "/api/v1/users/change-password",
    updateDetails: "/api/v1/users/updateDetails",
    updateAvatar: "/api/v1/users/updateAvatar",
  },
  video: {
    allMine: (userId) => `/api/v1/video/v/allvideos?userId=${userId}`,
    byId: (id) => `/api/v1/video/v/${id}`,
    delete: (id) => `/api/v1/video/v/video-delete/${id}`,
    publish: "/api/v1/video/publish-video",
  },
  comment: {
    addByVideo: (videoId) => `/api/v1/comment/add-comment/v/${videoId}`,
  },
  like: {
    toggleVideo: (videoId) => `/api/v1/like/l/toggleVideoLike/${videoId}`,
    toggleComment: (commentId) =>
      `/api/v1/like/l/toggleCommentLike/${commentId}`,
  },
  playlist: {
    create: "/api/v1/playlist/create-playlist",
    userPlaylists: (userId) => `/api/v1/playlist/user-playlist/${userId}`,
    addVideo: (playlistId, videoId) =>
      `/api/v1/playlist/add-video-to-playlist/${playlistId}/${videoId}`,
    removeVideo: (playlistId, videoId) =>
      `/api/v1/playlist/remove-video-from-playlist/${playlistId}/${videoId}`,
  },
  subscription: {
    toggle: (channelId) => `/api/v1/subcription/toggle/${channelId}`,
    subscribed: (subscriberId) =>
      `/api/v1/subcription/subscribed/${subscriberId}`,
  },
  tweet: {
    create: "/api/v1/tweet/create-tweet",
    all: "/api/v1/tweet/all-tweets",
    update: (tweetId) => `/api/v1/tweet/update-tweet/${tweetId}`,
    delete: (tweetId) => `/api/v1/tweet/delete-tweet/${tweetId}`,
  },
  admin: {
    overview: "/api/v1/admin/overview",
    promote: (userId) => `/api/v1/admin/promote-user/${userId}`,
  },
};
