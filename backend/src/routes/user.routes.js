import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginController,
  logoutController,
  refreshAccessToken,
  registerController,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerController
);
router.route("/login").post(loginController);
router.route("/logout").post(verifyJwt, logoutController);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJwt, changePassword);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/updateDetails").patch(verifyJwt, updateAccountDetails);
router
  .route("/updateAvatar")
  .patch(verifyJwt, upload.single("avatar"), updateAvatar);
router
  .route("/updateCoverImage")
  .patch(verifyJwt, upload.single("coverImage"), updateCoverImage);
router.route("/c/:username").get(verifyJwt, getUserChannelProfile);
router.route("/history").get(verifyJwt, getWatchHistory);

export default router;
