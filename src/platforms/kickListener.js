const WebSocket = require('ws');
const { moderateContent } = require('../services/moderationService');
const { searchMultiSource } = require('../services/multiSourceService');
const { addToQueue, getNextTrack, getCurrentTrack, getQueue } = require('../services/queueService');
const { getBroadcast } = require('../services/broadcastService');

let wss;

function start(webSocketServer) {
  wss = webSocketServer;
  // Kick chat WebSocket'e bağlan (örnek, gerçek implementasyon için Kick API dokümanına bakın)
  // Burada basit bir simülasyon veya gerçek bağlantı yapılabilir.
  console.log('Kick chat listener başlatıldı (kanal: ', process.env.KICK_CHANNEL_ID, ')');
  // Mesaj dinleyici:
  // KickChat.on('message', async (username, message) => handleMessage(username, message))
}

async function handleMessage(username, message) {
  if (message.startsWith('.mç')) {
    const songQuery = message.slice(3).trim();
    if (!songQuery) return broadcast({ type: 'error', message: 'Şarkı adı girin.' });

    const moderation = await moderateContent(songQuery, 'music');
    if (!moderation.allowed) {
      return broadcast({ type: 'error', message: moderation.reason });
    }

    try {
      const track = await searchMultiSource(songQuery);
      addToQueue(track, username);
      broadcast({ type: 'queue_update', queue: getQueue() });
      if (!getCurrentTrack()) {
        const next = getNextTrack();
        broadcast({ type: 'play', track: next, queue: getQueue() });
      }
    } catch (err) {
      broadcast({ type: 'error', message: err.message });
    }
  }
  else if (message.startsWith('.yç')) {
    const broadcastName = message.slice(3).trim().toLowerCase();
    const broadcast = getBroadcast(broadcastName);
    if (!broadcast) {
      return broadcast({ type: 'error', message: `Yayın bulunamadı. Mevcut: ${Object.keys(broadcasts).join(', ')}` });
    }
    // Yayını anında başlat (streaming)
    broadcast({
      type: 'play',
      track: {
        title: broadcast.name,
        artist: 'Canlı Yayın',
        streamUrl: broadcast.url,
        cover: ''
      },
      queue: []
    });
  }
  // Spam koruması için ardışık mesaj kontrolü yapılabilir (limiterService)
}

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

module.exports = { start };
