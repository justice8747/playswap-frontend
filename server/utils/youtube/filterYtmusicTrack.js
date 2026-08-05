const cleanTitle = (title) => {
  return title
    .replace(/\s*\(.*?\)/g, "") // remove (...)
    .replace(/\s*-\s*.*$/g, "") // remove - From "..."
    .replace(/\s*\[.*?\]/g, "") // remove [...]
    .trim();
};
export const normalizeYtmusicTrack = (track) => {
  if (!track || track.is_local) return null;
  return {
    trackId: track.videoId,
    title: cleanTitle(track.title),
    artists: cleanTitle(track.channel),
    duration: track.duration,
  };
};
