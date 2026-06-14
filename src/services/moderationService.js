const badWords = require('better-profanity');
const axios = require('axios');
const { apiKeys } = require('../config');

badWords.loadDictionary('tr');

async function moderateContent(text, type = 'text') {
  // 1. Profanity filter
  if (badWords.isProfane(text)) {
    return { allowed: false, reason: 'Uygunsuz kelime algılandı.' };
  }

  // 2. Cinsel içerik filtresi (basit regex + liste)
  const nsfwPattern = /(porno|sex|amcık|sik|yarak|sexs|sikiş)/i;
  if (nsfwPattern.test(text)) {
    return { allowed: false, reason: 'Cinsel içerik algılandı.' };
  }

  // 3. OpenAI Moderation (isteğe bağlı)
  if (apiKeys.openai && text.length > 3) {
    try {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: apiKeys.openai });
      const response = await openai.moderations.create({ input: text });
      const result = response.results[0];
      if (result.flagged) {
        return { allowed: false, reason: 'Yapay zeka uygunsuz içerik tespit etti.' };
      }
    } catch (e) {
      console.warn('OpenAI moderasyon hatası (devam ediliyor):', e.message);
    }
  }

  // 4. Telif kontrolü (Shazam) sadece müzik isteklerinde çağrılabilir,
  // burada yer kalmadığı için ileri seviyeye bırakılmıştır.
  return { allowed: true };
}

module.exports = { moderateContent };
