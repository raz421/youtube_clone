import mongoose from "mongoose";
import { Comment } from "../models/comments.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";
const getAllComments = asyncHandaller(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Valid videoId is required");
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

  if (
    !content?.trim() ||
    !videoId ||
    !mongoose.Types.ObjectId.isValid(videoId)
  ) {
    throw new ApiError(400, "Content and valid videoId are required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const comment = await Comment.create({
    content: content.trim(),
    owner: req.user._id,
    video: video._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});
const updateComment = asyncHandaller(async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Valid comment id is required");
  }
  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }
  const existingComment = await Comment.findById(id);

  if (!existingComment) {
    throw new ApiError(404, "Comment not found");
  }

  if (String(existingComment.owner) !== String(req.user?._id)) {
    throw new ApiError(403, "Only the comment owner can update this comment");
  }

  const newComment = await Comment.findByIdAndUpdate(
    id,
    {
      $set: {
        content: content.trim(),
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment updated successfully"));
});
const deleteComment = asyncHandaller(async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Valid comment id is required");
  }
  const existingComment = await Comment.findById(id);

  if (!existingComment) {
    throw new ApiError(404, "Comment not found");
  }

  if (String(existingComment.owner) !== String(req.user?._id)) {
    throw new ApiError(403, "Only the comment owner can delete this comment");
  }

  const deletedComment = await Comment.findByIdAndDelete(id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedCommentData: deletedComment },
        "Comment deleted successfully"
      )
    );
});

export { addComment, deleteComment, getAllComments, updateComment };
