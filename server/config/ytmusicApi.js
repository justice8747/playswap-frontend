import YTMusic from "ytmusic-api";

const ytmusic = new YTMusic();

let initialized = false;

export const initYTMusic = async () => {
  if (!initialized) {
    await ytmusic.initialize();
    initialized = true;
  }
};

export default ytmusic;
