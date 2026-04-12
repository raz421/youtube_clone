// g m b
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";
import {
  deleteFromCloudinary,
  extractCloudinaryPublicId,
  uploadToCloudinary,
} from "../utills/cloudinary.js";
const generateAccessAndTokenRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return {
      accessToken,
      refreshToken,
    };
  } catch (e) {
    throw new ApiError(
      500,
      e?.message ||
        "something went wrong when generating access and refresh token"
    );
  }
};

const refreshTokenSecret =
  process.env.REFRESH_TOKEN_SECRET ||
  (process.env.NODE_ENV !== "production" ? "dev-refresh-token-secret" : "");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const registerController = asyncHandaller(async (req, res) => {
  const { username, email, password, fullname } = req.body;
  console.log(req.body);
  const safeUsername = normalizeString(username).toLowerCase();
  const safeEmail = normalizeString(email).toLowerCase();
  const safeFullname = normalizeString(fullname);
  const safePassword = normalizeString(password);

  if (!safeUsername || !safeEmail || !safeFullname || !safePassword) {
    throw new ApiError(
      400,
      "fullname, username, email, and password are required"
    );
  }

  if (safePassword.length < 8) {
    throw new ApiError(400, "password must be at least 8 characters long");
  }

  const existedUser = await User.findOne({
    $or: [{ username: safeUsername }, { email: safeEmail }],
  });
  if (existedUser) {
    throw new ApiError(409, "user or email already  exist");
  }
  console.log("Files received:", req.files);
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  const avatar = avatarLocalPath
    ? await uploadToCloudinary(avatarLocalPath)
    : {
        url: `https://api.dicebear.com/8.x/glass/svg?seed=${encodeURIComponent(
          safeUsername
        )}`,
      };

  const coverImage = coverImageLocalPath
    ? await uploadToCloudinary(coverImageLocalPath)
    : null;

  if (!avatar?.url) {
    throw new ApiError(400, "avatar is required");
  }
  const user = await User.create({
    fullname: safeFullname,
    email: safeEmail,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: safeUsername,
    password: safePassword,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user ");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});
const loginController = asyncHandaller(async (req, res) => {
  const { username, email, password } = req.body;
  const safeUsername = normalizeString(username).toLowerCase();
  const safeEmail = normalizeString(email).toLowerCase();
  const safePassword = normalizeString(password);

  if (!safeUsername && !safeEmail) {
    throw new ApiError(404, "username or email is required");
  }
  if (!safePassword) {
    throw new ApiError(400, "password is required");
  }
  const user = await User.findOne({
    $or: [{ username: safeUsername }, { email: safeEmail }],
  });
  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const isPasswordValid = await user.isPassword(safePassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "invalid credential");
  }
  const { accessToken, refreshToken } =
    await generateAccessAndTokenRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user login successfully"
      )
    );
});
const logoutController = asyncHandaller(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "log out successfully"));
});
const refreshAccessToken = asyncHandaller(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorize request");
  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, refreshTokenSecret);
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndTokenRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "accessToken refreshed successfully "
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

const changePassword = asyncHandaller(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword) {
    throw new ApiError(401, "old password required");
  }
  const userId = req?.user?._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, "unauthorize access");
  }
  const passwordValid = await user.isPassword(oldPassword);
  if (!passwordValid) {
    throw new ApiError(401, "old password is wrong");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: true });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password successfully changed"));
});
const getCurrentUser = asyncHandaller(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "get current user successfully "));
});
const updateAccountDetails = asyncHandaller(async (req, res) => {
  const { fullname, email } = req.body;
  const safeFullname = normalizeString(fullname);
  const safeEmail = normalizeString(email).toLowerCase();

  if (!safeFullname && !safeEmail) {
    throw new ApiError(400, "At least one field is required");
  }

  const updateFields = {};
  if (safeFullname) {
    updateFields.fullname = safeFullname;
  }
  if (safeEmail) {
    updateFields.email = safeEmail;
  }

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: updateFields,
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "user account details update successfully")
    );
});

const updateAvatar = asyncHandaller(async (req, res) => {
  const avatarLocalPath = req?.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(
      404,
      "Avatar local path is not found  when update avatar"
    );
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(401, "User not found when updating the avatar");
  }

  // Upload new avatar first
  const avatar = await uploadToCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(
      400,
      "Avatar upload failed to cloudinary when update a avatar"
    );
  }

  // Delete old avatar if it exists
  if (user.avatar) {
    const publicId = extractCloudinaryPublicId(user.avatar);
    if (publicId) {
      console.log("Deleting old avatar with public_id:", publicId);
      await deleteFromCloudinary(publicId);
    }
  }

  // Update user with new avatar URL
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});
const updateCoverImage = asyncHandaller(async (req, res) => {
  const coverImageLocalPath = req?.file.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage  is not found");
  }
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(403, "User not found when updating coverImage");
  }

  const coverImage = await uploadToCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "CoverImage not upload in cloudinary ");
  }
  if (user.coverImage) {
    const publicId = extractCloudinaryPublicId(user.coverImage);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { coverImage: coverImage.url },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "CoverImage updated successfully"));
});
const getUserChannelProfile = asyncHandaller(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channalSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channalSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  // if (!channel?.length) {
  //   throw new ApiError(404, "channel does not exist");
  // }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});
const getWatchHistory = asyncHandaller(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullname: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetched successfully"
      )
    );
});

export {
  changePassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginController,
  logoutController,
  refreshAccessToken,
  registerController,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
};
// b g
