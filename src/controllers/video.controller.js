import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utills/cloudinary.js";

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
  const video = await Video.findById(id);
  if (!video) {
    throw new ApiError(404, "video not found when update video details");
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
  if (video.thumbnail) {
    const public_id = video.thumbnail.split("/").pop().split(".")[0];
    await deleteFromCloudinary(public_id);
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

const getAllVideos = asyncHandaller(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    userId,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  const sortedOrder = sortType === "asc" ? 1 : -1;
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };
  const video = await Video.aggregatePaginate(
    Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: {
          [sortBy]: sortedOrder,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
          pipeline: [
            {
              $project: {
                username: 1,
                fullname: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          ownerDetails: {
            $first: "$ownerDetails",
          },
        },
      },
    ]),
    options
  );
  return res
    .status(200)
    .json(new ApiResponse(200, video, "videos fetched successfully"));
});
// sample response
// {
//   "success": true,
//   "message": "Videos fetched successfully",
//   "data": {
//     "docs": [
//       {
//         "_id": "66fe7bcad7f05f342d9a7e34",
//         "title": "My First Video",
//         "views": 120,
//         "ownerDetails": {
//           "username": "Meharaz",
//           "email": "meharaz@example.com"
//         }
//       },
//       ...
//     ],
//     "totalDocs": 25,
//     "limit": 10,
//     "page": 1,
//     "totalPages": 3,
//     "hasNextPage": true
//   }
// }

export {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishVideo,
  togglePublishVideo,
  updateVideoDetails,
};
