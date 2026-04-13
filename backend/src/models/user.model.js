import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";

const getJwtConfig = () => {
  const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "dev-access-token-secret"
      : undefined);

  const refreshTokenSecret =
    process.env.REFRESH_TOKEN_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "dev-refresh-token-secret"
      : undefined);

  return {
    accessTokenSecret,
    refreshTokenSecret,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "10d",
  };
};

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  console.log(this.password);
  next();
});
userSchema.methods.isPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
  const { accessTokenSecret, accessTokenExpiry } = getJwtConfig();

  if (!accessTokenSecret) {
    throw new Error("ACCESS token secret is not configured");
  }

  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullname: this.fullname,
      role: this.role || "user",
    },
    accessTokenSecret,
    {
      expiresIn: accessTokenExpiry,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  const { refreshTokenSecret, refreshTokenExpiry } = getJwtConfig();

  if (!refreshTokenSecret) {
    throw new Error("REFRESH token secret is not configured");
  }

  return jwt.sign(
    {
      _id: this._id,
    },
    refreshTokenSecret,
    {
      expiresIn: refreshTokenExpiry,
    }
  );
};
export const User = mongoose.model("User", userSchema);
