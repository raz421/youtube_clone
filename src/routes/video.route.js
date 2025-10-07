import { Router } from "express";
import {
  deleteVideo,
  getVideoById,
  publishVideo,
  updateVideoDetails,
} from "../controllers/video.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();
router.route("/publish-video").post(
  verifyJwt,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideo
);

router.route("/v/:id").get(verifyJwt, getVideoById);

router
  .route("/v/update-video-details/:id")
  .patch(verifyJwt, upload.single("thumbnail"), updateVideoDetails);

router.route("/v/video-delete/:id").delete(verifyJwt, deleteVideo);
export default router;
