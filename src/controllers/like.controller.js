import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const toggleVideoLike = asyncHandaller(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid videoId is required");
  }

  const existedLikedVideo = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existedLikedVideo) {
    const unlikeVideo = await Like.findByIdAndDelete(existedLikedVideo._id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: false, unlikeVideo },
          "Video unliked successfully"
        )
      );
  }

  const likeVideo = await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked: true, likeVideo },
        "Video liked successfully"
      )
    );
});

const toggleCommentLike = asyncHandaller(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Valid commentId is required");
  }

  const existedLikedComment = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existedLikedComment) {
    const unlikeComment = await Like.findByIdAndDelete(existedLikedComment._id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: false, unlikeComment },
          "Comment unliked successfully"
        )
      );
  }

  const likeComment = await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked: true, likeComment },
        "Comment liked successfully"
      )
    );
});

const toggleTweetLike = asyncHandaller(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Valid tweetId is required");
  }

  const existedLikedTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existedLikedTweet) {
    const unlikeTweet = await Like.findByIdAndDelete(existedLikedTweet._id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: false, unlikeTweet },
          "Tweet unliked successfully"
        )
      );
  }

  const likeTweet = await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked: true, likeTweet },
        "Tweet liked successfully"
      )
    );
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
