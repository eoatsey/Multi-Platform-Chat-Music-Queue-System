// Ön tanımlı radyolar (M3U8 / stream URL'leri)
const broadcasts = {
  trtfm: { name: 'TRT FM', url: 'https://trtcanliyayin.trtworld.com/trtfm/index.m3u8' },
  powerturk: { name: 'Power Türk', url: 'https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio' },
  radyo7: { name: 'Radyo 7', url: 'https://radyo7.radyotvonline.com/radyo7' }
};

function getBroadcast(name) {
  return broadcasts[name.toLowerCase()] || null;
}

function getBroadcastList() {
  return Object.keys(broadcasts).map(key => ({ id: key, ...broadcasts[key] }));
}

module.exports = { getBroadcast, getBroadcastList };
