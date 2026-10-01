const { CORS_ORIGINS } = require('../config/env');

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (origin) {
    const isAllowed = CORS_ORIGINS.includes('*') || CORS_ORIGINS.includes(origin);

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    } else if (req.method === 'OPTIONS') {
      return res.status(403).json({ error: 'CORS origin not allowed.' });
    }
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}

module.exports = corsMiddleware;
