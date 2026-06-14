const { getLimiter } = require('./limiterService');
const queue = [];
let currentTrack = null;
const history = []; // son 10 şarkı (prev için)

function addToQueue(track, username) {
  const limiter = getLimiter(username);
  if (!limiter.canAdd()) {
    throw new Error('12 saatte en fazla 3 şarkı ekleyebilirsiniz.');
  }
  queue.push({
    ...track,
    user: username,
    addedAt: Date.now()
  });
}

function getNextTrack() {
  if (queue.length === 0) return null;
  const track = queue.shift();
  currentTrack = track;
  history.unshift(track);
  if (history.length > 10) history.pop();
  return track;
}

function getCurrentTrack() {
  return currentTrack;
}

function getQueue() {
  return queue;
}

module.exports = { addToQueue, getNextTrack, getCurrentTrack, getQueue };
