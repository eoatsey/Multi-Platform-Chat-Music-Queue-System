const userLimits = new Map();

class RateLimiter {
  constructor() {
    this.requests = [];
    this.MAX_REQUESTS = 3;
    this.WINDOW_MS = 12 * 60 * 60 * 1000; // 12 saat
  }

  canAdd() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.WINDOW_MS);
    if (this.requests.length >= this.MAX_REQUESTS) return false;
    this.requests.push(now);
    return true;
  }
}

function getLimiter(username) {
  if (!userLimits.has(username)) {
    userLimits.set(username, new RateLimiter());
  }
  return userLimits.get(username);
}

module.exports = { getLimiter };
