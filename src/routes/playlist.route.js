import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.cntroller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

// Apply authentication to all playlist routes
router.use(verifyJwt);

router.route("/create-playlist").post(createPlaylist);
router.route("/user-playlist/:userId").get(getUserPlaylist);
router.route("/playlistById/:playListId").get(getPlaylistById);
router
  .route("/add-video-to-playlist/:playListId/:videoId")
  .post(addVideoToPlaylist);
router
  .route("/remove-video-from-playlist/:playListId/:videoId")
  .get(removeVideoFromPlaylist);
router.route("/delete-playlist/:playListId").delete(deletePlaylist);
router.route("/update-playlist/:playListId").patch(updatePlaylist);

export default router;
