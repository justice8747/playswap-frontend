import CustomError from "../../../utils/CustomError.js";
import { getAccessTokenFromDB } from "../../getAccessTokenFromDB.js";
import { parseIsoDuration } from "../parseIsoDuration.js";

const searchYoutube = async (title, artist, userId) => {
  const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
  const accessToken = await getAccessTokenFromDB(userId, "youtube");
  try {
    const query = `${artist} - ${title} Audio`;

    const searchParams = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      videoCategoryId: "10",
      maxResults: "5",
    });

    const searchRes = await fetch(
      `${YOUTUBE_API_BASE}/search?${searchParams.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!searchRes.ok) {
      const err = await searchRes.json();
      throw new CustomError(err.error?.message || "YouTube Search API Failed");
    }

    const searchDataJson = await searchRes.json();

    if (!searchDataJson.items || searchDataJson.items.length === 0) {
      return [];
    }

    const videoIds = searchDataJson.items
      .map((item) => item.id.videoId)
      .join(",");

    const videoParams = new URLSearchParams({
      part: "contentDetails,snippet",
      id: videoIds,
    });

    const videoRes = await fetch(
      `${YOUTUBE_API_BASE}/videos?${videoParams.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!videoRes.ok) throw new CustomError("Failed to fetch video details");

    const videoDetails = await videoRes.json();
    return videoDetails.items.map((video) => {
      const durationSec =
        parseIsoDuration(video.contentDetails.duration) * 1000; // Convert to ms

      return {
        type: "VIDEO",
        videoId: video.id,
        name: video.snippet.title,
        artist: video.snippet.channelTitle,
        duration: durationSec,
      };
    });
  } catch (err) {
    console.error("Error fetching track from official API:", err);
    throw new CustomError("Failed to fetch track from official API");
  }
};

export const fetchTrackFromOfficialApi = async (title, artist, userId) => {
  const candidates = await searchYoutube(title, artist, userId);

  if (candidates.length === 0) {
    return {
      matched: false,
      reason: "NO_RESULTS",
      candidates: [],
    };
  }

  return {
    matched: true,
    candidates,
  };
};
