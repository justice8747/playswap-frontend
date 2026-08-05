import { fetchTrack } from "../youtube/fetchTrack.js";
import { findBestMatch } from "./matchResolver.js";
import { officialApiBestMatch } from "../youtube/fetchFromOfficailApi/officailApiMatchResolver.js";
import { BestMatch } from "../youtube/youtubei/youtubeiMatchResolver.js";
import { FAILURE_REASONS } from "./matchResolver.js";
import { searchWithInnerTube } from "../youtube/youtubei/youtubei.js";
import { fetchTrackFromOfficialApi } from "../youtube/fetchFromOfficailApi/fetchTrackFromOfficialApi.js";
import { fetchTrackFromDB } from "./fetchTrackFromDB.js";
export const analyzeSpotifyTracks = async (track, userId) => {
  const searchQuery = `${track.title}`;

  try {
    const cachedTrack = await fetchTrackFromDB(track.trackId);
    if (cachedTrack) {
      return cachedTrack;
    }
    const innerTubeCandidates = await searchWithInnerTube({
      title: track.title,
      artist: track.primaryArtist,
    });

    if (innerTubeCandidates.length === 0) {
      return {
        spotifyTrackId: track.id,
        title: track.title,
        artist: track.primaryArtist,
        matched: false,
        failureReason: FAILURE_REASONS.NO_RESULTS,
      };
    }

    let bestMatch;

    bestMatch = BestMatch(track, innerTubeCandidates.candidates);

    if (!bestMatch || !bestMatch.videoId) {
      const ytmusicApiCandidates = await fetchTrack(searchQuery);
      if (!ytmusicApiCandidates.candidates.length) {
        return {
          spotifyTrackId: track.id,
          title: track.title,
          artist: track.primaryArtist,
          matched: false,
          failureReason: FAILURE_REASONS.NO_RESULTS,
        };
      }

      bestMatch = findBestMatch(track, ytmusicApiCandidates.candidates);
      if (!bestMatch || !bestMatch.videoId) {
        const officialApiCandidates = await fetchTrackFromOfficialApi(
          track.title,
          track.primaryArtist,
          userId,
        );
        if (!officialApiCandidates.candidates.length) {
          return {
            spotifyTrackId: track.id,
            title: track.title,
            artist: track.primaryArtist,
            matched: false,
            failureReason: FAILURE_REASONS.NO_RESULTS,
          };
        }
        bestMatch = officialApiBestMatch(
          track,
          officialApiCandidates.candidates,
        );
        if (!bestMatch || !bestMatch.videoId) {
          return {
            spotifyTrackId: track.id,
            title: track.title,
            artist: track.primaryArtist,
            matched: false,
            failureReason: FAILURE_REASONS.LOW_CONFIDENCE,
          };
        }
      }
    }

    return {
      spotifyTrackId: track.id,
      title: track.title,
      artist: track.primaryArtist,
      matched: true,
      youtubeVideoId: bestMatch.videoId,
      confidence: bestMatch.score,
    };
  } catch (err) {
    return {
      spotifyTrackId: track.id,
      title: track.title,
      artist: track.primaryArtist,
      matched: false,
      failureReason: FAILURE_REASONS.API_ERROR,
    };
  }
};
