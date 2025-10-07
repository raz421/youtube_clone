import { Video } from "../models/video.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";
import { uploadToCloudinary } from "../utills/cloudinary.js";

const publishVideo = asyncHandaller(async (req, res) => {
  const { title, description } = req.body;
  console.log(req.body);
  if (!title || !description) {
    throw new ApiError(401, "All fields are required");
  }

  const videoLocalPath = req?.files?.video[0]?.path;
  const thumbnailLocalPath = req?.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(
      401,
      "videoLocalPath and thumbnailLocalPath are not found when published a video"
    );
  }
  const video = await uploadToCloudinary(videoLocalPath);
  const thumbnail = await uploadToCloudinary(thumbnailLocalPath);
  if (!video.url || !thumbnail.url) {
    throw new ApiError(
      401,
      "video and thumbnail url  not found when upload  a video in cloudinay"
    );
  }
  const duration = video.duration;
  const videToPublished = await Video.create({
    videoFile: video.url,
    title,
    description,
    owner: req.user?._id,
    thumbnail: thumbnail.url,
    isPublished: true,
    duration,
  });
  return res
    .status(201)
    .json(new ApiResponse(200, videToPublished, "video succesfully published"));
});
const getVideoById = asyncHandaller(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "videoId not found in the url");
  }
  const video = await Video.findById(id);
  if (!video) {
    throw new ApiError(404, "Video not Found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});
const updateVideoDetails = asyncHandaller(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "videoId not found in the url");
  }
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError("Title and Description Field are required");
  }
  const thumbnailLocalPath = req?.file?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(
      401,
      "thumbnailLocalPath are not found when update video details"
    );
  }
  const thumbnail = await uploadToCloudinary(thumbnailLocalPath);
  if (!thumbnail.url) {
    throw new ApiError(401, "thumbnail not upload in Cloudinary");
  }
  const updateVideo = await Video.findByIdAndUpdate(
    id,
    {
      $set: {
        title,
        thumbnail: thumbnail.url,
        description,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, updateVideo, "Video details update successfully")
    );
});
const deleteVideo = asyncHandaller(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "videoId not found in the url");
  }
  const deletedVideoInfo = await Video.findByIdAndDelete(id);
  if (!deletedVideoInfo) {
    throw new ApiError(404, "video not found when delete a video");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedVideoInfo: deletedVideoInfo },
        "video delete successfully"
      )
    );
});
const togglePublishVideo = asyncHandaller(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "videoId not found in the url");
  }
  const video = await Video.findById(id);

  if (!video) {
    throw new ApiError(404, "Video not Found");
  }
  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "toggle a publish in a video sucessfully")
    );
});
export {
  deleteVideo,
  getVideoById,
  publishVideo,
  togglePublishVideo,
  updateVideoDetails,
};
