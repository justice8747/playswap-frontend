import { getAccessTokenFromDB } from "../utils/getAccessTokenFromDB.js";

export const createSpotifyPlaylist = async (user_Id, finalName, trackUris) => {
  const accessToken = await getAccessTokenFromDB(user_Id, "spotify");

  const meRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const meData = await meRes.json();
  const spotifyId = meData.id;

  // 2. Create Playlist
  const createRes = await fetch(
    `https://api.spotify.com/v1/users/${spotifyId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: finalName,
        description: "Transferred via PlaySwap",
        public: false,
      }),
    },
  );

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || "Failed to create Spotify playlist");
  }

  const playlist = await createRes.json();

  // 3. Add Tracks (Batch 100)
  const chunkSize = 100;
  for (let i = 0; i < trackUris.length; i += chunkSize) {
    const chunk = trackUris.slice(i, i + chunkSize);
    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: chunk }),
    });
  }
  return {
    message: "tranfer successfully",
    url: playlist.external_urls.spotify,
  };
};
