// g m b
import { User } from "../models/user.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiRespone } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";
import { uploadToCloudinary } from "../utills/cloudinary.js";
const registerController = asyncHandaller(async (req, res) => {
  const { username, email, password, fullname } = req.body;
  if (
    [username, fullname, email, password]?.some((field) => field?.trim() === "")
  ) {
    throw ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "user or email already  exist");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
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
    coverImage: coverImage?.url || null,
    username: username.toLowerCase(),
    password,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw ApiError(500, "something went wrong while registering the user "); 
  }
  return res
    .status(201)
    .json(ApiRespone(200, createdUser, "User reister Successfully"));
});
export { registerController };
// b g