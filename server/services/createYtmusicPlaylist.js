import { getAccessTokenFromDB } from "../utils/getAccessTokenFromDB.js";
export const createYtmusicPlaylist = async (userId, finalName, trackIds) => {
  const accessToken = await getAccessTokenFromDB(userId, "youtube");

  const createRes = await fetch(
    "https://www.googleapis.com/youtube/v3/playlists?part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        snippet: {
          title: finalName,
          description: "Transferred via PlaySwap",
        },
        status: {
          privacyStatus: "private",
        },
      }),
    },
  );

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || "Failed to create playlist");
  }

  const playlist = await createRes.json();

  for (const videoId of trackIds) {
    const res = await fetch(
      "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            playlistId: playlist.id,
            resourceId: {
              kind: "youtube#video",
              videoId,
            },
          },
        }),
      },
    );

    if (!res.ok) {
      const error = await res.json();

      if (
        res.status === 403 &&
        error.error?.errors?.[0]?.reason === "quotaExceeded"
      ) {
        console.warn("YouTube quota exceeded. Stopping transfer.");
        break;
      }

      console.warn("Failed to insert video:", videoId);
    }
  }

  return {
    message: "Transfer completed",
    playlistId: playlist.id,
    url: `https://music.youtube.com/playlist?list=${playlist.id}`,
  };
};
