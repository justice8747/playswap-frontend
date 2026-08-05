const cleanTitle = (title) => {
  return title
    .replace(/\s*\(.*?\)/g, "") // remove (...)
    .replace(/\s*-\s*.*$/g, "") // remove - From "..."
    .replace(/\s*\[.*?\]/g, "") // remove [...]
    .trim();
};
export const normalizeSpotifyTrack = (track) => {
  if (!track || track.is_local) return null;

  return {
    trackId: track.id,
    title: cleanTitle(track.name),
    artists: track.artists.map((a) => a.name),
    primaryArtist: track.artists[0]?.name ?? null,
    duration: track.duration_ms,
  };
};
