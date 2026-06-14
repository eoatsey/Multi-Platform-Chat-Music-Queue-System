const axios = require('axios');
const { apiKeys } = require('../config');

async function searchMultiSource(query) {
  const sources = [];
  
  // YouTube Music
  if (apiKeys.youtube) {
    try {
      const ytRes = await searchYouTube(query);
      if (ytRes) sources.push({ ...ytRes, source: 'youtube', quality: 9 });
    } catch (e) { console.warn('YouTube search failed'); }
  }

  // Spotify (preview URL'leri ücretsizdir)
  if (apiKeys.spotify.clientId) {
    try {
      const spRes = await searchSpotify(query);
      if (spRes) sources.push({ ...spRes, source: 'spotify', quality: 8 });
    } catch (e) { console.warn('Spotify search failed'); }
  }

  // SoundCloud
  if (apiKeys.soundcloud) {
    try {
      const scRes = await searchSoundCloud(query);
      if (scRes) sources.push({ ...scRes, source: 'soundcloud', quality: 7 });
    } catch (e) { console.warn('SoundCloud search failed'); }
  }

  // Deezer
  if (apiKeys.deezer) {
    try {
      const dzRes = await searchDeezer(query);
      if (dzRes) sources.push({ ...dzRes, source: 'deezer', quality: 6 });
    } catch (e) { console.warn('Deezer search failed'); }
  }

  if (sources.length === 0) throw new Error('Hiçbir kaynaktan sonuç alınamadı.');
  
  sources.sort((a, b) => b.quality - a.quality);
  const best = sources[0];
  return {
    title: best.title,
    artist: best.artist,
    streamUrl: best.streamUrl,
    cover: best.cover || '',
    duration: best.duration
  };
}

// Gerçek API çağrıları (özet):
async function searchYouTube(query) {
  // youtube-music-api kullanımı veya basit yt-dlp fallback
  // Örnek: youtubeMusicApi.searchSongs(query) -> en uygun formatlı stream URL'si
  const { searchSongs } = require('youtube-music-api');
  const songs = await searchSongs(query);
  if (!songs.length) return null;
  const song = songs[0];
  return {
    title: song.title,
    artist: song.artists[0]?.name,
    streamUrl: `https://www.youtube.com/watch?v=${song.videoId}`,
    cover: song.thumbnails[0]?.url,
    duration: song.duration
  };
}

async function searchSpotify(query) {
  const SpotifyWebApi = require('spotify-web-api-node');
  const spotify = new SpotifyWebApi({
    clientId: apiKeys.spotify.clientId,
    clientSecret: apiKeys.spotify.clientSecret
  });
  const data = await spotify.clientCredentialsGrant();
  spotify.setAccessToken(data.body.access_token);
  const res = await spotify.searchTracks(query, { limit: 1 });
  const track = res.body.tracks.items[0];
  return track ? {
    title: track.name,
    artist: track.artists[0].name,
    streamUrl: track.preview_url,
    cover: track.album.images[0]?.url,
    duration: track.duration_ms / 1000
  } : null;
}

async function searchSoundCloud(query) {
  // soundcloud-api ile
  return null; // örnek
}
async function searchDeezer(query) {
  return null; // örnek
}

module.exports = { searchMultiSource };
