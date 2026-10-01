const express = require('express');
const path = require('path');
const securityHeaders = require('./middleware/securityHeaders');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 1. Security & CORS middleware
app.use(securityHeaders);
app.use(corsMiddleware);

// 2. Body parser with strict payload size bounding (1MB) to prevent memory exhaustion DoS
app.use(express.json({ limit: '1mb' }));

// 3. Static assets serving
app.use(express.static(PROJECT_ROOT));

// 4. API Endpoints
app.use('/api', apiRoutes);

// 5. HTML Entry Route Aliases
app.get(['/', '/index.html', '/syndx-review-console-full.html'], (req, res) => {
  res.sendFile(path.join(PROJECT_ROOT, 'index.html'));
});

// 6. Centralized Error Handling
app.use(errorHandler);

module.exports = app;
