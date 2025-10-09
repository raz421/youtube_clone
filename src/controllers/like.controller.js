import { Like } from "../models/like.model.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";

const toggleVideoLike = asyncHandaller(async (req, res) => {
  const { videoId } = req.params;
  const existedLiekedVideo = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  
});
