// utils/youtube/parseIsoDuration.js

export const parseIsoDuration = (isoDuration) => {
  const regex = /P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);

  if (!matches) {
    return 0;
  }

  const days = parseInt(matches[1] || 0, 10);
  const hours = parseInt(matches[2] || 0, 10);
  const minutes = parseInt(matches[3] || 0, 10);
  const seconds = parseInt(matches[4] || 0, 10);

  return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
};
