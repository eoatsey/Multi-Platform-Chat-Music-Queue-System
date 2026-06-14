const WS_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'ws://localhost:3000'
  : 'wss://your-backend.onrender.com';  // Production'da backend adresi

let socket;
let reconnectTimer;

function connectWebSocket() {
  socket = new WebSocket(WS_URL);
  socket.onopen = () => {
    console.log('WebSocket bağlandı');
    if (reconnectTimer) clearTimeout(reconnectTimer);
  };
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      window.dispatchEvent(new CustomEvent('ws-message', { detail: data }));
    } catch (e) {
      console.error('Mesaj parse hatası:', e);
    }
  };
  socket.onclose = () => {
    console.log('Bağlantı koptu, 5sn sonra tekrar denenecek');
    reconnectTimer = setTimeout(connectWebSocket, 5000);
  };
  socket.onerror = (err) => console.error('WebSocket hatası:', err);
}
connectWebSocket();

window.sendWS = (msg) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
};
