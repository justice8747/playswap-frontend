import { fetchTracks } from "../spotify/fetchTracks.js";
import { FAILURE_REASONS } from "./matchRovolver.js";
import { findBestMatch } from "./matchRovolver.js";
import { fetchTrackFromDB } from "./fetchTrackFromDB.js";
export const analyzeYtmusicTracks = async (track, userId) => {
  try {
    const cachedTrack = await fetchTrackFromDB(track.trackId);
    if (cachedTrack) {
      return cachedTrack;
    }
    const spotifyCandidates = await fetchTracks(
      track.title,
      track.artists,
      userId,
    );

    if (spotifyCandidates.candidates.length === 0) {
      return {
        youtubeTrackId: track.id,
        title: track.title,
        artist: track.artists,
        matched: false,
        failureReason: FAILURE_REASONS.NO_RESULTS,
      };
    }

    const bestMatch = findBestMatch(track, spotifyCandidates.candidates);

    if (!bestMatch) {
      return {
        youtubeTrackId: track.trackId,
        title: track.title,
        artist: track.artists,
        matched: false,
        failureReason: FAILURE_REASONS.LOW_CONFIDENCE,
      };
    }

    return {
      youtubeTrackId: track.trackId,
      title: track.title,
      artist: track.artists,
      matched: true,
      spotifyTrackId: bestMatch.trackId,
      confidence: bestMatch.score,
    };
  } catch (error) {
    return {
      youtubeTrackId: track.id,
      title: track.title,
      artist: track.artist,
      matched: false,
      failureReason: FAILURE_REASONS.API_ERROR,
    };
  }
};
