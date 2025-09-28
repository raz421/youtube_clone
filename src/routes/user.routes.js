import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshAccessToken,
  registerController,
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

export default router;
