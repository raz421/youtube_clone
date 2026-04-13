import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utills/ApiError.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";

const accessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET ||
  (process.env.NODE_ENV !== "production" ? "dev-access-token-secret" : "");

const verifyJwt = asyncHandaller(async (req, res, next) => {
  try {
    // console.log("header of auth", req.header("Authorization"));
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorize request");
    }
    const decodedToken = jwt.verify(token, accessTokenSecret);
    // console.log("Decoded Token Result", decodedToken);
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "user not found");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid Accesstoken");
  }
});

const requireRole = (...allowedRoles) =>
  asyncHandaller(async (req, _res, next) => {
    const currentRole = req.user?.role || "user";

    if (!allowedRoles.length || allowedRoles.includes(currentRole)) {
      next();
      return;
    }

    throw new ApiError(403, "You are not authorized to access this resource");
  });

export { requireRole, verifyJwt };
