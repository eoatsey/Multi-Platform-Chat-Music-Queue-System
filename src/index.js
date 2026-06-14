const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { port } = require('./config');
const { initDatabase } = require('./models/database');
const apiRoutes = require('./routes/api');
const { setupWebSocket } = require('./routes/websocket');
const kickListener = require('./platforms/kickListener');

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

setupWebSocket(wss);

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    wss.emit('connection', ws, request);
  });
});

initDatabase().then(() => {
  server.listen(port, () => {
    console.log(`🚀 Sunucu ${port} portunda çalışıyor`);
    if (process.env.KICK_CHANNEL_ID) {
      kickListener.start(wss);
    }
  });
});
