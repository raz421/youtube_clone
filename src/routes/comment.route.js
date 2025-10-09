import { Router } from "express";
import {
  addComment,
  deleteComment,
  getAllComments,
  updateComment,
} from "../controllers/comment.controller.js";

import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJwt);
router.route("/add-comment/v/:videoId").post(addComment);
router.route("/allComments/v/:videoId").get(getAllComments);
router.route("/update-comment/:id").get(updateComment);
router.route("/delete-comment/:id").get(deleteComment);

export default router;
