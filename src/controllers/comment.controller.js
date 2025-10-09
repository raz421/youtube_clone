import mongoose from "mongoose";
import { Comment } from "../models/comments.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";
const getAllComments = asyncHandaller(async (req, res) => { 
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(401, "ViodeoId is required");
  }
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };
  const allComments = await Comment.aggregatePaginate(
    Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "commentedVideoDetails",
        },
      },
      {
        $addFields: {
          commentedVideoDetails: {
            $first: "$commentedVideoDetails",
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]),
    options
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allComments,
        "all comment for this video fetched successfully"
      )
    );
});
const addComment = asyncHandaller(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content || !videoId) {
    throw new ApiError(401, "Content and ViodeoId is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video is not found when add a commnt");
  }
  const comment = await Comment.create({
    content,
    owner: req.user._id,
    video: video._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment added successfully"));
});
const updateComment = asyncHandaller(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "commntid is not found when update comment");
  }
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "content is required");
  }
  const newComment = await Comment.findByIdAndUpdate(
    id,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "new comment added successfully"));
});
const deleteComment = asyncHandaller(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "commntid is not found when delete a comment");
  }
  const deletedComment = await Comment.findByIdAndDelete(id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedCommentData: deletedComment },
        "deleted comment successfully"
      )
    );
});

export { addComment, deleteComment, getAllComments, updateComment };
