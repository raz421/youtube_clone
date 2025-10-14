import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";
const createPlaylist = asyncHandaller(async (req, res) => {
  const { description, name } = req.body;
  if (!description || !name) {
    throw new ApiError(401, "All Fields are required");
  }
  console.log("User from createPlaylist", req.user);
  const playList = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playList: playList },
        "playlist successfully created"
      )
    );
});
const getUserPlaylist = asyncHandaller(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(404, "User Id is required when getUserPlaylist");
  }
  const userPlayList = await Playlist.find({ owner: userId });
  if (!userPlayList) {
    throw new ApiError(400, "No Playlist Found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlayList, "UserPlaylist fetched successfully")
    );
});
const getPlaylistById = asyncHandaller(async (req, res) => {
  const { playListId } = req.params;
  if (!playListId) {
    throw new ApiError(404, "PlayList Id is required ");
  }
  const playList = await Playlist.findById(playListId);
  if (!playList) {
    throw new ApiError(404, "PlayList not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playList, "playlist fetched successfully"));
});
const addVideoToPlaylist = asyncHandaller(async (req, res) => {
  const { playListId, videoId } = req.params;
  if (!playListId || !videoId) {
    throw new ApiError(401, "playlist and video id is required");
  }

  const playlistExists = await Playlist.findById(playListId);
  if (!playlistExists) {
    throw new ApiError(404, "Playlist not found");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playListId,
    {
      $addToSet: { videos: videoId },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "video added to playlist"));
});
const removeVideoFromPlaylist = asyncHandaller(async (req, res) => {
  const { playListId, videoId } = req.params;
  if (!playListId || !videoId) {
    throw new ApiError(401, "playlist and video id is required");
  }
  const playList = await Playlist.findByIdAndUpdate(
    playListId,
    {
      $unset: { videos: videoId },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, { playList }, "video remove to playlist"));
});
const deletePlaylist = asyncHandaller(async (req, res) => {
  const { playListId } = req.params;
  if (!playListId) {
    throw new ApiError(401, "playlist id is required");
  }
  const playList = await Playlist.findByIdAndDelete(playListId);
  return res
    .status(200)
    .json(new ApiResponse(200, playList, "playlist deleted successfully"));
});
const updatePlaylist = asyncHandaller(async (req, res) => {
  const { playListId } = req.params;
  const { description, name } = req.body;
  if (!playListId) {
    throw new ApiError(401, "playlist id is required");
  }
  if (!name || !description) {
    throw new ApiError(401, "name and descriptions are requird");
  }
  const playList = await Playlist.findByIdAndUpdate(
    playListId,
    {
      $set: { name, description },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, playList, "update playlist details successfully")
    );
});
export {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
};
