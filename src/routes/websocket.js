function setupWebSocket(wss) {
  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.action === 'next') {
          const next = require('../services/queueService').getNextTrack();
          if (next) {
            broadcast(wss, { type: 'play', track: next, queue: require('../services/queueService').getQueue() });
          }
        }
      } catch (e) {}
    });
  });
}

function broadcast(wss, data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(JSON.stringify(data));
  });
}

module.exports = { setupWebSocket };
