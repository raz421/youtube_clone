import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subsCriptions.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";

const toggleSubscription = asyncHandaller(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user?._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }
  if (channelId === subscriberId.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }
  const existingSubscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });
  if (existingSubscription) {
    await existingSubscription.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed successfully"));
  }
  await Subscription.create({
    subscriber: subscriberId,
    channel: channelId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Subscribed successfully"));
});

const getUserChannelSubscribers = asyncHandaller(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channel id");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }
  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber",
    "name"
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandaller(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "invalid subscriber id");
  }
  const subscriptions = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "name");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptions,
        "Subscribed channels fetched successfully"
      )
    );
});

export { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription };
