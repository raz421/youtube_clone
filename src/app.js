import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import userRouter from "../src/routes/user.routes.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.router.js";
import playlistRouter from "./routes/playlist.route.js";
import publicApiRouter from "./routes/publicApi.route.js";
import subcriptionRouter from "./routes/subcription.route.js";
import tweetRouter from "./routes/tweet.route.js";
import videoRouter from "./routes/video.route.js";

const parseCorsOrigins = () => {
  if (!process.env.CORS_ORIGIN) {
    return [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ];
  }

  return process.env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseCorsOrigins();

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "VidVortex backend is running",
    health: "/health",
  });
});

app.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/", publicApiRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/subcription", subcriptionRouter);
app.use("/api/v1/tweet", tweetRouter);

app.use((err, _req, res, _next) => {
  const statusCode = err?.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err?.message || "Internal server error",
    errors: err?.errors || [],
  });
});

export default app;
