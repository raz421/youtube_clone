import mongoose from "mongoose";
import { Comment } from "../models/comments.model.js";
import { Like } from "../models/like.model.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getAdminOverview = asyncHandaller(async (_req, res) => {
  const [users, videos, playlists, comments, likes, recentUsers, recentVideos] =
    await Promise.all([
      User.countDocuments(),
      Video.countDocuments(),
      Playlist.countDocuments(),
      Comment.countDocuments(),
      Like.countDocuments(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select("username fullname email avatar role createdAt")
        .lean(),
      Video.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select("title thumbnail views isPublished owner createdAt")
        .populate("owner", "username fullname avatar role")
        .lean(),
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totals: {
          users,
          videos,
          playlists,
          comments,
          likes,
        },
        recentUsers,
        recentVideos,
      },
      "Admin overview fetched successfully"
    )
  );
});

const promoteUserToAdmin = asyncHandaller(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Valid userId is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(400, "User is already an admin");
  }

  user.role = "admin";
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
      "User promoted to admin successfully"
    )
  );
});

export { getAdminOverview, promoteUserToAdmin };
