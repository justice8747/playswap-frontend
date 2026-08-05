import { Innertube } from "youtubei.js";

const youtube = await Innertube.create();

export const searchWithInnerTube = async ({ title, artist }) => {
  const query = `${title} ${artist}`;
  try {
    const results = await youtube.search(query, {
      type: "video",
    });

    if (results.videos.length === 0) {
      return {
        matched: false,
        candidates: [],
      };
    }

    const candidates = results.videos.map((video) => ({
      videoId: video.id,
      title: video.title?.text ?? null,
      artist: video.author.name,
      duration: video.duration.seconds * 1000,
    }));

    return {
      matched: true,
      candidates,
    };
  } catch (error) {
    console.error("Error searching with InnerTube", error);
    return [];
  }
};
