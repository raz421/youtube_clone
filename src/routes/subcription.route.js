import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/toggle/:channelId").post(toggleSubscription);
router.route("/subscribers/:channelId").get(getUserChannelSubscribers);
router.route("/subscribed/:subscriberId").get(getSubscribedChannels);

export default router;
