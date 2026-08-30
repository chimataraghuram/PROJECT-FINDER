const buckets = new Map();

export const rateLimit = ({ windowMs = 60_000, max = 60 } = {}) => (req, res, next) => {
  const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.startedAt >= windowMs) buckets.set(key, { startedAt: now, count: 1 });
  else if (++bucket.count > max) return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  res.setHeader('RateLimit-Limit', max);
  next();
};

setInterval(() => { const cutoff = Date.now() - 10 * 60_000; for (const [key, bucket] of buckets) if (bucket.startedAt < cutoff) buckets.delete(key); }, 10 * 60_000).unref();
