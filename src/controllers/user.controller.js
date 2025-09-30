// g m b
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";
import { uploadToCloudinary } from "../utills/cloudinary.js";
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
      $set: {
        refreshToken: undefined,
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
  const incomingAccessToken = req.cookies("refreshToken") || req.body;
  if (!incomingAccessToken) {
    throw new ApiError(401, "unauthorize request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingAccessToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    if (user.refreshToken !== incomingAccessToken) {
      throw new ApiError(401, "unauthorize access");
    }

    const options = {
      httpOnly: true,
      secrure: true,
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
  res.status(200).json(new ApiResponse(200, {}, "password successfully save"));
});

export {
  changePassword,
  loginController,
  logoutController,
  refreshAccessToken,
  registerController,
};
// b g
