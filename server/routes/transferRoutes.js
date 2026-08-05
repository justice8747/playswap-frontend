import express from "express";
import { getTransferHistory } from "../controllers/transferController/getTransferHistory.js";
import { requireAuth } from "../middleware/SpotifyTokenValidation.js";

const router = express.Router();

router.get("/history", requireAuth, getTransferHistory);

export default router;
