export const buildStats = (results) => {
  const total = results.length;

  const readyToTransfer = results.filter((r) => r.matched).length;
  const failed = results.filter((r) => !r.matched);

  const matchPercentage =
    total === 0 ? 0 : Math.round((readyToTransfer / total) * 100);

  return {
    stats: {
      total_tracks: total,
      ready_to_transfer: readyToTransfer,
      failed_tracks: failed.length,
      match_percentage: matchPercentage,
    },

    Missing_tracks: failed.map((f) => ({
      title: f.title,
      artist: f.artist,
      reason: f.failureReason,
    })),
  };
};
