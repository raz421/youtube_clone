import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getAllUserTweet,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/create-tweet").post(createTweet);
router.route("/all-tweets").get(getAllUserTweet);
router.route("/update-tweet/:tweetId").patch(updateTweet);
router.route("/delete-tweet/:tweetId").delete(deleteTweet);

export default router;
