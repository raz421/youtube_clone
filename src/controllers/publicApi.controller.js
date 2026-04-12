import mongoose from "mongoose";
import { Comment } from "../models/comments.model.js";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { WatchEvent } from "../models/watchEvent.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";
import { normalizeMediaUrl, uploadToCloudinary } from "../utills/cloudinary.js";

const safeObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }

  return new mongoose.Types.ObjectId(value);
};

const detectMood = (title = "", description = "") => {
  const text = `${title} ${description}`.toLowerCase();

  if (/(study|learn|tutorial|guide|code|build)/.test(text)) {
    return "Learn";
  }

  if (/(lofi|sleep|calm|chill|ambient|relax|meditation)/.test(text)) {
    return "Relax";
  }

  return "Focus";
};

const serializeVideo = (videoDoc) => {
  const data = videoDoc.toObject ? videoDoc.toObject() : videoDoc;
  const owner = data.owner;

  const ownerDetails =
    owner && typeof owner === "object"
      ? {
          _id: owner._id || owner.id || owner,
          username: owner.username || "",
          fullname: owner.fullname || "",
          avatar: owner.avatar || "",
        }
      : null;

  return {
    id: data._id,
    title: data.title,
    description: data.description,
    thumbnail: normalizeMediaUrl(data.thumbnail),
    videoFile: normalizeMediaUrl(data.videoFile),
    duration: data.duration,
    views: data.views,
    isPublished: data.isPublished,
    mood: detectMood(data.title, data.description),
    owner: owner && typeof owner === "object" ? owner._id || owner.id : owner,
    ownerDetails,
    createdAt: data.createdAt,
  };
};

const serializeComment = (commentDoc) => {
  const data = commentDoc?.toObject ? commentDoc.toObject() : commentDoc;
  const owner = data?.owner;

  return {
    _id: data?._id,
    content: data?.content,
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
    owner: owner
      ? {
          _id: owner?._id || owner,
          username: owner?.username || "",
          fullname: owner?.fullname || "",
          avatar: owner?.avatar || "",
        }
      : null,
  };
};

const formatClockTime = (seconds) => {
  const total = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

const getMostWatchedMoments = async (videoId) => {
  const moments = await WatchEvent.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $group: {
        _id: "$second",
        totalHits: { $sum: "$hits" },
      },
    },
    {
      $sort: {
        totalHits: -1,
      },
    },
    {
      $limit: 5,
    },
  ]);

  if (!moments.length) {
    return [
      {
        label: "Peak engagement",
        time: "01:12",
      },
      {
        label: "Most replayed",
        time: "03:48",
      },
    ];
  }

  return moments.map((moment, index) => ({
    label: index === 0 ? "Most watched" : `High attention #${index + 1}`,
    time: formatClockTime(moment._id),
    hits: moment.totalHits,
  }));
};

const getVideos = asyncHandaller(async (req, res) => {
  const { limit = 24, page = 1, mood } = req.query;
  const parsedLimit = Math.min(Number(limit) || 24, 60);
  const parsedPage = Math.max(Number(page) || 1, 1);

  const allVideos = await Video.find({ isPublished: true })
    .populate("owner", "username fullname avatar role")
    .sort({ createdAt: -1 })
    .skip((parsedPage - 1) * parsedLimit)
    .limit(parsedLimit)
    .lean();

  const withMood = allVideos.map((video) => ({
    ...serializeVideo(video),
  }));

  const filteredVideos = mood
    ? withMood.filter(
        (video) => video.mood.toLowerCase() === String(mood).toLowerCase()
      )
    : withMood;

  return res
    .status(200)
    .json(new ApiResponse(200, filteredVideos, "Videos fetched successfully"));
});

const getVideoDetails = asyncHandaller(async (req, res) => {
  const { id } = req.params;
  const videoId = safeObjectId(id);

  if (!videoId) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId)
    .populate("owner", "username fullname avatar role")
    .lean();
  if (!video || !video.isPublished) {
    throw new ApiError(404, "Video not found");
  }

  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

  const [comments, likesCount, watchMoments] = await Promise.all([
    Comment.find({ video: videoId })
      .sort({ createdAt: -1 })
      .limit(40)
      .populate("owner", "username fullname avatar")
      .lean(),
    Like.countDocuments({ video: videoId }),
    getMostWatchedMoments(videoId),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...serializeVideo(video),
        views: (video.views || 0) + 1,
        likesCount,
        aiSummary:
          "This video breaks the topic into concise, practical moments so you can quickly learn and apply each idea.",
        watchMoments,
        comments: comments.map((comment) => serializeComment(comment)),
      },
      "Video details fetched successfully"
    )
  );
});

const uploadVideo = asyncHandaller(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req?.files?.video?.[0]?.path;
  const thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path;
  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Both video and thumbnail files are required");
  }

  const [videoAsset, thumbnailAsset] = await Promise.all([
    uploadToCloudinary(videoLocalPath),
    uploadToCloudinary(thumbnailLocalPath),
  ]);

  if (!videoAsset?.url || !thumbnailAsset?.url) {
    throw new ApiError(500, "Unable to upload media assets");
  }

  const createdVideo = await Video.create({
    title,
    description,
    videoFile: videoAsset.url,
    thumbnail: thumbnailAsset.url,
    duration: videoAsset.duration || 0,
    owner: req.user?._id,
    isPublished: true,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        serializeVideo(createdVideo),
        "Video uploaded successfully"
      )
    );
});

const postLike = asyncHandaller(async (req, res) => {
  const { videoId } = req.body;
  const safeVideoId = safeObjectId(videoId);
  if (!safeVideoId) {
    throw new ApiError(400, "videoId is required");
  }

  const existingLike = await Like.findOne({
    video: safeVideoId,
    likedBy: req.user._id,
  });

  let liked;
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    liked = false;
  } else {
    await Like.create({
      video: safeVideoId,
      likedBy: req.user._id,
    });
    liked = true;
  }

  const likesCount = await Like.countDocuments({ video: safeVideoId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { liked, likesCount }, "Like updated successfully")
    );
});

const postComment = asyncHandaller(async (req, res) => {
  const { videoId, content } = req.body;
  const safeVideoId = safeObjectId(videoId);
  if (!safeVideoId || !content) {
    throw new ApiError(400, "videoId and content are required");
  }

  const video = await Video.findById(safeVideoId).lean();
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const createdComment = await Comment.create({
    content,
    video: safeVideoId,
    owner: req.user._id,
  });

  const createdCommentWithOwner = await Comment.findById(createdComment._id)
    .populate("owner", "username fullname avatar")
    .lean();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        serializeComment(createdCommentWithOwner),
        "Comment added successfully"
      )
    );
});

const getSearchResults = asyncHandaller(async (req, res) => {
  const { q = "" } = req.query;
  if (!q.trim()) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Search query is empty"));
  }

  const regex = new RegExp(q, "i");
  const videos = await Video.find({
    isPublished: true,
    $or: [{ title: regex }, { description: regex }],
  })
    .populate("owner", "username fullname avatar role")
    .sort({ views: -1, createdAt: -1 })
    .limit(30)
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      videos.map((video) => serializeVideo(video)),
      "Search completed"
    )
  );
});

const getRecommendations = asyncHandaller(async (_req, res) => {
  const recommendations = await Video.find({ isPublished: true })
    .populate("owner", "username fullname avatar role")
    .sort({ views: -1, createdAt: -1 })
    .limit(12)
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      recommendations.map((video) => ({
        ...serializeVideo(video),
        reason: video.views > 100 ? "Trending now" : "Fresh for you",
      })),
      "Recommendations fetched successfully"
    )
  );
});

const postWatchEvent = asyncHandaller(async (req, res) => {
  const {
    videoId,
    currentSecond = 0,
    durationWatched = 0,
    completed = false,
  } = req.body;

  const safeVideoId = safeObjectId(videoId);
  if (!safeVideoId) {
    throw new ApiError(400, "Valid videoId is required");
  }

  const second = Math.max(0, Math.floor(Number(currentSecond) || 0));
  const duration = Math.max(0, Number(durationWatched) || 0);

  await WatchEvent.findOneAndUpdate(
    {
      user: req.user._id,
      video: safeVideoId,
      second,
    },
    {
      $setOnInsert: {
        user: req.user._id,
        video: safeVideoId,
        second,
      },
      $set: {
        lastSeenAt: new Date(),
      },
      $inc: {
        hits: 1,
        totalWatchDuration: duration,
        completionCount: completed ? 1 : 0,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: {
      watchHistory: safeVideoId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { ok: true }, "Watch event tracked"));
});

const getMyWatchAnalytics = asyncHandaller(async (req, res) => {
  const analytics = await WatchEvent.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $group: {
        _id: "$user",
        totalWatchDuration: { $sum: "$totalWatchDuration" },
        totalHits: { $sum: "$hits" },
        totalCompletions: { $sum: "$completionCount" },
        watchedVideos: { $addToSet: "$video" },
      },
    },
  ]);

  const metric = analytics[0] || {
    totalWatchDuration: 0,
    totalHits: 0,
    totalCompletions: 0,
    watchedVideos: [],
  };

  const watchedVideoCount = metric.watchedVideos.length;
  const completionRate = watchedVideoCount
    ? Math.min(
        100,
        Math.round((metric.totalCompletions / watchedVideoCount) * 100)
      )
    : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalMinutes: Math.round(metric.totalWatchDuration / 60),
        completionRate,
        totalSessions: metric.totalHits,
        watchedVideoCount,
      },
      "Watch analytics fetched successfully"
    )
  );
});

export {
  getMyWatchAnalytics,
  getRecommendations,
  getSearchResults,
  getVideoDetails,
  getVideos,
  postComment,
  postLike,
  postWatchEvent,
  uploadVideo,
};
