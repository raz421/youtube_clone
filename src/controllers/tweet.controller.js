import { Tweet } from "../models/tweet.model";
import { ApiError } from "../utills/ApiError";
import { ApiResponse } from "../utills/ApiResponse";
import { asyncHandaller } from "../utills/asyncHandaller";

const createTweet = asyncHandaller(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(403, "content is required");
  }
  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet created successfully"));
});
const getAllUserTweet = asyncHandaller(async (req, res) => {
  const usersTweet = await Tweet.find();
  if (!usersTweet) {
    throw new ApiError(404, "users not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, usersTweet, "All users tweet fetched successfully")
    );
});
const updateTweet = asyncHandaller(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!tweetId) {
    throw new ApiError(400, "tweetId is not found");
  }
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content: content,
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet updated successfully"));
});
const deleteTweet = asyncHandaller(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "tweetId is not found");
  }
  const tweet = await Tweet.findByIdAndDelete(tweetId);
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet deleted successfully"));
});
export { createTweet, deleteTweet, getAllUserTweet, updateTweet };
