import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import userRouter from "../src/routes/user.routes.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.router.js";
import videoRouter from "./routes/video.route.js";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/like", likeRouter);

export default app;
