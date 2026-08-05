import express from "express";
import { getAccessToken } from "../controllers/spotifyControllers/GetSpotifyAccessToken.js";
import { getAccessTokenDoorB } from "../controllers/spotifyControllers/GetSpotifyAccessTokenDoorB.js";
import { spotifyAuth } from "../controllers/spotifyControllers/Spotifyauth.js";
import { spotifyAuthProtected } from "../controllers/spotifyControllers//SpotifyAuthProtected.js";
import { getAllSpotyPlaylists } from "../controllers/spotifyControllers/GetAllSpotifyPlaylists.js";
import { requireAuth } from "../middleware/SpotifyTokenValidation.js";
import { getUser } from "../controllers/spotifyControllers/GetSpotifyUser.js";
import { sessionUpgrade } from "../controllers/spotifyControllers/SessionUpgrade.js";
import { analyzePlaylists } from "../controllers/spotifyControllers/analyzePlaylists.js";
import executeTransfer from "../controllers/transferController/transferController.js";

const router = express.Router();

router.get("/spotify/callback", getAccessToken);
router.get("/connect/spotify/callback", getAccessTokenDoorB);
router.get("/api/me/spotify", requireAuth, getUser);
router.get("/spotify/auth", spotifyAuth);
router.get("/spotify/connect", requireAuth, spotifyAuthProtected);
router.get("/spotify/getplaylists", requireAuth, getAllSpotyPlaylists);
router.post("/api/spotify/session-upgrade", sessionUpgrade);
router.post("/api/spotify/analyze/playlists", requireAuth, analyzePlaylists);
router.post("/api/spotify/execute/transfer", requireAuth, executeTransfer);

export default router;
