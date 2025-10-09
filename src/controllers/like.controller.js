import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";

const toggleVideoLike = asyncHandaller(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, "videoId not found in the url");
  }
  const existedLikedVideo = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  if (existedLikedVideo) {
    const unlikeVideo = await Like.findByIdAndDelete(existedLikedVideo._id);
    return res
      .status(200)
      .json(new ApiResponse(200, unlikeVideo, "video unlike successfully"));
  } else {
    const likeVideo = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, likeVideo, "video like successfully"));
  }
});
const toggleCommentLike = asyncHandaller(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(404, "commentId not found in the url");
  }
  const existedLikedComment = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });
  if (existedLikedComment) {
    const unlikeComment = await Like.findByIdAndDelete(existedLikedComment._id);
    return res
      .status(200)
      .json(new ApiResponse(200, unlikeComment, "comment unlike successfully"));
  } else {
    const likeVideo = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, likeVideo, "comment like successfully"));
  }
});
const toggleTweetLike = asyncHandaller(async (req, res) => {
  const { tweetId } = req.params;
  const existedLikedTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  if (existedLikedTweet) {
    const unlikeTweet = await Like.findByIdAndDelete(existedLikedTweet._id);
    return res
      .status(200)
      .json(new ApiResponse(200, unlikeTweet, "Tweet unlike successfully"));
  } else {
    const likeTweet = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, likeTweet, "Tweet Like successfully"));
  }
});
const getAllLikedVideos = asyncHandaller(async (req, res) => {
  const allVideoUserLike = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $addFields: {
        videoDetails: {
          $first: "$videoDetails",
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allVideoUserLike,
        "All Liked Videos fetched successfully"
      )
    );
});

export {
  getAllLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
};
