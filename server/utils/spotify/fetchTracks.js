import CustomError from "../CustomError.js";
import { getAccessTokenFromDB } from "../getAccessTokenFromDB.js";
export const fetchTracks = async (title, artist, userId) => {
  const query = encodeURIComponent(`track:${title} artist:${artist}`);

  try {
    const accessToken = await getAccessTokenFromDB(userId, "spotify");

    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      return {
        matched: false,
        reason: "NO_RESULTS",
        candidates: [],
      };
    }

    const data = await res.json();

    const candidates = data.tracks.items.map((track) => ({
      trackId: track.id,
      title: track.name,
      artists: track.artists[0]?.name,
      duration: track.duration_ms,
    }));

    return {
      matched: true,
      candidates,
    };
  } catch (error) {
    throw new CustomError("Failed to fetch Spotify tracks", error);
  }
};
