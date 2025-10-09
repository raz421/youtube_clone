import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishVideo,
  togglePublishVideo,
  updateVideoDetails,
} from "../controllers/video.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();
router.use(verifyJwt);
router.route("/publish-video").post(
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideo
);
router.route("/v/allvideos").get(getAllVideos);  
router.route("/v/:id").get(getVideoById);        
router
  .route("/v/update-video-details/:id")
  .patch(upload.single("thumbnail"), updateVideoDetails);

router.route("/v/video-delete/:id").delete(deleteVideo);
router.route("/v/video-publish-toggle/:id").get(togglePublishVideo);
export default router;
