import express from "express";
import { getYoutubeMusicAccessToken } from "../controllers/ytmusicControllers/GetYtmusicAccessToken.js";
import { getYoutubeMusicAccessTokenDoorB } from "../controllers/ytmusicControllers/GetYtmusicAccessTokenDoorB.js";
import { ytmusicAuth } from "../controllers/ytmusicControllers/YtmusicAuth.js";
import { ytmusicAuthProtected } from "../controllers/ytmusicControllers/YtmusicAuthProtected.js";
import { getAllYtmusicPlaylists } from "../controllers/ytmusicControllers/GetAllYtmusicPlaylist.js";
import { requireAuth } from "../middleware/YtMusicTokenValidation.js";
import { getUser } from "../controllers/ytmusicControllers/GetYtMusicUser.js";
import { sessionUpgrade } from "../controllers/ytmusicControllers/SessionUpgrade.js";
import { analyzePlaylists } from "../controllers/ytmusicControllers/analyzePlaylists.js";
import executeTransfer from "../controllers/transferController/transferController.js";
const router = express.Router();

router.get("/youtube/callback", getYoutubeMusicAccessToken);
router.get("/connect/youtube/callback", getYoutubeMusicAccessTokenDoorB);
router.get("/ytmusic/auth", ytmusicAuth);
router.get("/ytmusic/connect", requireAuth, ytmusicAuthProtected);
router.post("/api/ytmusic/session-upgrade", sessionUpgrade);
router.get("/api/me/ytmusic", requireAuth, getUser);
router.get("/ytmusic/getplaylists", requireAuth, getAllYtmusicPlaylists);
router.post("/api/ytmusic/analyze/playlists", requireAuth, analyzePlaylists);
router.post("/api/ytmusic/execute/transfer", requireAuth, executeTransfer);

export default router;
