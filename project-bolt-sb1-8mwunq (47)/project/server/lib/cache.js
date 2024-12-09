import NodeCache from 'node-cache';

// Cache süresi (saniye)
const CACHE_TTL = 300; // 5 dakika

// Cache instance'ı oluştur
const cache = new NodeCache({
  stdTTL: CACHE_TTL,
  checkperiod: CACHE_TTL * 0.2,
  useClones: false
});

// Cache middleware
export const cacheMiddleware = (key) => (req, res, next) => {
  try {
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }
    
    // Orijinal json metodunu sakla
    const originalJson = res.json;
    
    // json metodunu override et
    res.json = (data) => {
      cache.set(key, data);
      return originalJson.call(res, data);
    };
    
    next();
  } catch (err) {
    console.error('Cache hatası:', err);
    next();
  }
};

// Belirli bir anahtarı önbelleğe alma
export const cacheSet = (key, data) => {
  return cache.set(key, data);
};

// Önbellekten veri alma
export const cacheGet = (key) => {
  return cache.get(key);
};

// Önbellekten veri silme
export const cacheDelete = (key) => {
  return cache.del(key);
};

// Tüm önbelleği temizleme
export const cacheClear = () => {
  return cache.flushAll();
};