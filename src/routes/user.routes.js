import { Router } from "express";
import { registerController } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: 1,
      coverImage: 1,
    },
  ]),
  registerController
);
export default router;
