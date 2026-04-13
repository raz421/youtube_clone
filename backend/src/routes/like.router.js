import { Router } from "express";
import {
  getAllLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
const router = Router();
router.use(verifyJwt);
router.route("/l/getAllLikedVideos").get(getAllLikedVideos);
router.route("/l/toggleVideoLike/:videoId").get(toggleVideoLike);
router.route("/l/toggleCommentLike/:commentId").get(toggleCommentLike);
router.route("/l/toggleTweetLike/:tweetId").get(toggleTweetLike);
export default router;
