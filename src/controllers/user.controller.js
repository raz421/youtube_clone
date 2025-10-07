// g m b
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";
import {
  deleteFromCloudinary,
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
      "something went wrong when generating access and refresh token"
    );
  }
};
const registerController = asyncHandaller(async (req, res) => {
  const { username, email, password, fullname } = req.body;
  console.log(req.body);
  if (
    [username, fullname, email, password]?.some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "user or email already  exist");
  }
  console.log("Files received:", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "local avatar is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar is required");
  }
  const user = await User.create({
    fullname,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    password,
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
  if (!username && !email) {
    throw new ApiError(404, "username or email is required");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const isPasswordValid = await user.isPassword(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "invalid credential");
  }
  const { accessToken, refreshToken } =
    await generateAccessAndTokenRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "log out successfully"));
});
const refreshAccessToken = asyncHandaller(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorize request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, refreshToken } =
      await generateAccessAndTokenRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
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
  if (!fullname || !email) {
    throw new ApiError(400, "Atleast one fields  are required");
  }
  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        fullname,
        email,
      },
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
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(401, "User not found when updating the avatar");
  }

  // Upload new avatar first
  const avatar = await uploadToCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // Delete old avatar if it exists
  if (user.avatar) {
    const publicId = user.avatar.split("/").pop().split(".")[0];
    console.log("Deleting old avatar with public_id:", publicId);
    await deleteFromCloudinary(publicId);
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
    const publicId = user.coverImage.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
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

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exist");
  }
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
        localField: "watchistory",
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
      new ApiResponse(200, user[0].watchHistory),
      "Watch History fetched successfully"
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
