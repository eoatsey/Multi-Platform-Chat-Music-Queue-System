require('dotenv').config();
module.exports = {
  port: process.env.PORT || 3000,
  dbPath: process.env.DB_PATH || './data/musicqueue.db',
  kickChannelId: process.env.KICK_CHANNEL_ID,
  apiKeys: {
    youtube: process.env.YOUTUBE_API_KEY,
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    },
    soundcloud: process.env.SOUNDCLOUD_CLIENT_ID,
    deezer: process.env.DEEZER_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    shazam: process.env.SHAZAM_API_KEY
  }
};
