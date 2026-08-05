import ytmusic from "../../config/ytmusicApi.js";
import { initYTMusic } from "../../config/ytmusicApi.js";
export const fetchTrack = async (query) => {
  try {
    await initYTMusic();

    const results = await ytmusic.search(query, "songs");
    if (results.length === 0) {
      return {
        matched: false,
        reason: "NO_RESULTS",
        candidates: [],
      };
    }

    const filterResults = results.filter(
      (track) => track.type.toLocaleLowerCase() === "song",
    );

    const candidates = filterResults.map((track) => ({
      videoId: track.videoId,
      title: track.name,
      artist: track.artist?.name,
      duration: track.duration_ms,
    }));

    return {
      matched: true,
      candidates,
    };
  } catch (error) {
    console.error("Error fetching track from YTMusic API", error);
    return {
      matched: false,
      reason: "API_ERROR",
      candidates: [],
    };
  }
};
