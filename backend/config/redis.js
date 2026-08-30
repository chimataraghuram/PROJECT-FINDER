import Redis from 'ioredis';

export const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 }) : null;
export const redisHealth = async () => {
  if (!redis) return { configured: false, connected: false };
  try { await redis.connect().catch(() => {}); const pong = await redis.ping(); return { configured: true, connected: pong === 'PONG' }; }
  catch { return { configured: true, connected: false }; }
};
