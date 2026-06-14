const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const timeInfo = document.getElementById('timeInfo');
const albumArt = document.getElementById('albumArt');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const queueList = document.getElementById('queueList');

let currentTrack = null;
let isPlaying = false;

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = `${percent}%`;
  timeInfo.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
});

audio.addEventListener('ended', () => {
  window.sendWS({ action: 'next' });
});

playBtn.addEventListener('click', () => {
  if (!audio.src) return;
  if (audio.paused) {
    audio.play().then(() => {
      playBtn.textContent = '⏸';
      isPlaying = true;
    }).catch(() => {});
  } else {
    audio.pause();
    playBtn.textContent = '▶';
    isPlaying = false;
  }
});

nextBtn.addEventListener('click', () => window.sendWS({ action: 'next' }));
prevBtn.addEventListener('click', () => window.sendWS({ action: 'prev' })); // tarihçe yoksa pasif

function loadTrack(track) {
  currentTrack = track;
  trackTitle.textContent = track.title || 'Bilinmeyen';
  trackArtist.textContent = track.artist || '';
  albumArt.src = track.cover || 'assets/placeholder.png';
  audio.src = track.streamUrl;
  audio.load();
  playBtn.textContent = '▶';
  isPlaying = false;
}

function updateQueue(queue) {
  queueList.innerHTML = '';
  queue.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.title}</span> <span class="queue-user">@${item.user}</span>`;
    queueList.appendChild(li);
  });
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Backend'den gelen komutları dinle
window.addEventListener('ws-message', (e) => {
  const data = e.detail;
  switch(data.type) {
    case 'play':
      loadTrack(data.track);
      if (data.track.streamUrl) {
        audio.play().then(() => {
          playBtn.textContent = '⏸';
          isPlaying = true;
        }).catch(err => console.warn('Oynatma başlatılamadı:', err));
      }
      break;
    case 'queue_update':
      updateQueue(data.queue);
      break;
    case 'error':
      alert(data.message);
      break;
  }
});
