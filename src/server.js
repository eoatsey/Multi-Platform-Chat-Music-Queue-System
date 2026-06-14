const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.static(path.join(__dirname, '..')));
app.use(express.json());

// Müzik Kuyruğu Yönetimi
class MusicQueue {
    constructor() {
        this.queue = [];
        this.currentTrack = null;
        this.isPlaying = false;
    }

    add(track) {
        this.queue.push(track);
        this.broadcast({
            type: 'queue_update',
            queue: this.queue
        });
    }

    skip() {
        if (this.queue.length > 0) {
            this.currentTrack = this.queue.shift();
            this.isPlaying = true;
            this.broadcast({
                type: 'track_update',
                track: this.currentTrack
            });
            return this.currentTrack;
        }
        return null;
    }

    getQueue() {
        return this.queue;
    }

    clear() {
        this.queue = [];
        this.currentTrack = null;
        this.isPlaying = false;
        this.broadcast({
            type: 'queue_update',
            queue: this.queue
        });
    }

    broadcast(data) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
}

const musicQueue = new MusicQueue();

// Mock Müzik Arama
function searchMusic(query) {
    const mockTracks = {
        'test': { title: 'Test Şarkısı', artist: 'Test Artist', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: '3:33' },
        'müzik': { title: 'Müzik Zamanı', artist: 'Müzisyen', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: '4:20' },
    };

    const key = query.toLowerCase().trim();
    if (mockTracks[key]) {
        return mockTracks[key];
    }

    return {
        title: query,
        artist: 'Bilinmeyen Sanatçı',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: '3:33'
    };
}

// Chat Komutlarını İşle
function processCommand(message, username) {
    const parts = message.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    let response = '';

    switch (command) {
        case '!play':
            if (!args) {
                response = '❌ Lütfen şarkı adı belirtin: !play [şarkı adı]';
            } else {
                const track = searchMusic(args);
                musicQueue.add(track);
                response = `✅ ${track.title} - ${track.artist} sıraya eklendi!`;
            }
            break;

        case '!skip':
            const skipped = musicQueue.skip();
            if (skipped) {
                response = `⏭ Şimdi çalıyor: ${skipped.title}`;
            } else {
                response = '❌ Kuyrukta müzik yok!';
            }
            break;

        case '!queue':
            const queue = musicQueue.getQueue();
            if (queue.length === 0) {
                response = '📭 Kuyruk boş';
            } else {
                response = `📋 ${queue.length} şarkı sırada`;
            }
            break;

        case '!stop':
            musicQueue.clear();
            response = '⏹ Müzik durduruldu';
            break;

        case '!help':
            response = '📚 !play !skip !queue !stop !help';
            break;

        default:
            if (message.startsWith('!')) {
                response = '❌ Bilinmeyen komut';
            } else {
                response = null;
            }
    }

    if (response) {
        return {
            type: 'command_response',
            message: response,
            username: username
        };
    }

    return null;
}

// WebSocket
wss.on('connection', (ws) => {
    console.log('✅ Istemci bağlandı');

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);

            if (message.type === 'chat') {
                const response = processCommand(message.content, message.username);
                if (response) {
                    ws.send(JSON.stringify(response));
                    musicQueue.broadcast({
                        type: 'queue_update',
                        queue: musicQueue.getQueue()
                    });
                }
            }
        } catch (error) {
            console.error('Hata:', error);
        }
    });
});

// API
app.get('/api/queue', (req, res) => {
    res.json({ queue: musicQueue.getQueue() });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/docs/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'docs', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎵 Sunucu başladı: http://localhost:${PORT}`);
});

module.exports = { app, musicQueue };
