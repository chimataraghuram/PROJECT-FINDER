export const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  const requestId = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  res.on('finish', () => {
    console.info(JSON.stringify({ type: 'http_request', method: req.method, route: req.originalUrl.split('?')[0], status: res.statusCode, latencyMs: Date.now() - startedAt, requestId }));
  });
  next();
};
