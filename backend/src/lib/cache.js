require('dotenv').config();
const NodeCache = require('node-cache');
const crypto = require('crypto');

/**
 * Configuration
 */
const DEFAULT_TTL = Number.isFinite(Number(process.env.CACHE_EXPIRATION))
  ? Number(process.env.CACHE_EXPIRATION)
  : 300;

const CHECK_PERIOD = Number.isFinite(Number(process.env.CACHE_CLEANUP_INTERVAL))
  ? Number(process.env.CACHE_CLEANUP_INTERVAL)
  : 600;

/**
 * Cache Instance
 */
const myCache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: CHECK_PERIOD,
  useClones: false
});

/**
 * Cache Events
 */
myCache.on('expired', (key) => {
  console.log(`[CACHE] Expired: ${key}`);
});

/**
 * Cache Prefixes
 */
const PREFIXES = {
  BLACKLIST: 'blacklist'
};

/**
 * Cache Keys
 */
const CACHE_KEYS = {
  ANALYTICS: 'admin:analytics'
};

/**
 * Helpers
 */
const cacheKey = (prefix, key) => `${prefix}:${key}`;

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const isValidKey = (key) =>
  typeof key === 'string' && key.trim().length > 0;

/**
 * Generic Cache Operations
 */
const set = (key, value, ttl = DEFAULT_TTL) => {
  if (!isValidKey(key)) return false;

  return myCache.set(key, value, ttl);
};

const get = (key) => {
  if (!isValidKey(key)) return undefined;

  return myCache.get(key);
};

const del = (key) => {
  if (!isValidKey(key)) return 0;

  return myCache.del(key);
};

const has = (key) => {
  if (!isValidKey(key)) return false;

  return myCache.has(key);
};

const flush = () => myCache.flushAll();

const stats = () => myCache.getStats();

/**
 * Cache-Aside Helper
 *
 * Example:
 *
 * const analytics = await getOrSet(
 *   CACHE_KEYS.ANALYTICS,
 *   300,
 *   async () => {
 *     return await calculateAnalytics();
 *   }
 * );
 */
const getOrSet = async (
  key,
  ttl = DEFAULT_TTL,
  callback
) => {
  const cached = get(key);

  if (cached !== undefined) {
    return cached;
  }

  const value = await callback();

  set(key, value, ttl);

  return value;
};

/**
 * JWT Blacklist
 */
const setBlacklistedToken = (
  token,
  ttlSeconds
) => {
  if (
    typeof token !== 'string' ||
    token.length === 0 ||
    ttlSeconds <= 0
  ) {
    return false;
  }

  const tokenHash = hashToken(token);

  return set(
    cacheKey(PREFIXES.BLACKLIST, tokenHash),
    true,
    ttlSeconds
  );
};

const isBlacklistedToken = (token) => {
  if (
    typeof token !== 'string' ||
    token.length === 0
  ) {
    return false;
  }

  const tokenHash = hashToken(token);

  return (
    get(
      cacheKey(PREFIXES.BLACKLIST, tokenHash)
    ) === true
  );
};

/**
 * Analytics Cache
 */
const getAnalytics = () =>
  get(CACHE_KEYS.ANALYTICS);

const setAnalytics = (
  value,
  ttlSeconds = 300
) =>
  set(
    CACHE_KEYS.ANALYTICS,
    value,
    ttlSeconds
  );

/**
 * Graceful Shutdown
 */
process.on('SIGTERM', () => {
  console.log('[CACHE] Shutdown');
});

process.on('SIGINT', () => {
  console.log('[CACHE] Shutdown');
});

/**
 * Exports
 */
module.exports = {
  set,
  get,
  del,
  has,
  flush,
  stats,
  getOrSet,
  cacheKey,
  hashToken,

  setBlacklistedToken,
  isBlacklistedToken,

  getAnalytics,
  setAnalytics,

  CACHE_KEYS,
  PREFIXES
};