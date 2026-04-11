import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandaller } from "../utills/asyncHandaller.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const assertPlaylistOwner = (playlist, userId) => {
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (!userId || String(playlist.owner) !== String(userId)) {
    throw new ApiError(403, "Only the playlist owner can perform this action");
  }
};

const createPlaylist = asyncHandaller(async (req, res) => {
  const { description, name } = req.body;

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: req.user?._id,
    videos: [],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylist = asyncHandaller(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Valid userId is required");
  }

  const playlists = await Playlist.find({ owner: userId })
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandaller(async (req, res) => {
  const { playListId } = req.params;

  if (!isValidObjectId(playListId)) {
    throw new ApiError(400, "Valid playlist id is required");
  }

  const playlist = await Playlist.findById(playListId)
    .populate("videos")
    .lean();

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandaller(async (req, res) => {
  const { playListId, videoId } = req.params;

  if (!isValidObjectId(playListId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid playlist and video ids are required");
  }

  const playlist = await Playlist.findById(playListId);
  assertPlaylistOwner(playlist, req.user?._id);

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playListId,
    {
      $addToSet: { videos: videoId },
    },
    {
      new: true,
    }
  ).populate("videos");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandaller(async (req, res) => {
  const { playListId, videoId } = req.params;

  if (!isValidObjectId(playListId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid playlist and video ids are required");
  }

  const playlist = await Playlist.findById(playListId);
  assertPlaylistOwner(playlist, req.user?._id);

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playListId,
    {
      $pull: { videos: videoId },
    },
    {
      new: true,
    }
  ).populate("videos");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist"));
});

const deletePlaylist = asyncHandaller(async (req, res) => {
  const { playListId } = req.params;

  if (!isValidObjectId(playListId)) {
    throw new ApiError(400, "Valid playlist id is required");
  }

  const playlist = await Playlist.findById(playListId);
  assertPlaylistOwner(playlist, req.user?._id);

  await Playlist.findByIdAndDelete(playListId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandaller(async (req, res) => {
  const { playListId } = req.params;
  const { description, name } = req.body;

  if (!isValidObjectId(playListId)) {
    throw new ApiError(400, "Valid playlist id is required");
  }

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.findById(playListId);
  assertPlaylistOwner(playlist, req.user?._id);

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playListId,
    {
      $set: {
        name: name.trim(),
        description: description.trim(),
      },
    },
    {
      new: true,
    }
  ).populate("videos");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
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
