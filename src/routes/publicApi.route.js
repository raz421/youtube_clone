import { Router } from "express";
import {
  getMyWatchAnalytics,
  getRecommendations,
  getSearchResults,
  getVideoDetails,
  getVideos,
  postComment,
  postLike,
  postWatchEvent,
  uploadVideo,
} from "../controllers/publicApi.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.get("/videos", getVideos);
router.get("/videos/:id", getVideoDetails);
router.get("/search", getSearchResults);
router.get("/recommendations", getRecommendations);

router.post(
  "/upload",
  verifyJwt,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);
router.post("/like", verifyJwt, postLike);
router.post("/comment", verifyJwt, postComment);
router.post("/analytics/watch", verifyJwt, postWatchEvent);
router.get("/analytics/me", verifyJwt, getMyWatchAnalytics);

export default router;
