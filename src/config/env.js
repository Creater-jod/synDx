const path = require('path');
const fs = require('fs');

// Attempt to load .env file if available in workspace root
const envPath = path.resolve(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envPath);
    } catch (err) {
      console.warn('[Config] Notice: process.loadEnvFile failed to parse .env:', err.message);
    }
  } else {
    // Basic fallback parser if process.loadEnvFile is unavailable
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx > 0) {
            const key = trimmed.substring(0, idx).trim();
            const val = trimmed.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    } catch (e) {
      console.warn('[Config] Notice: Could not read .env file:', e.message);
    }
  }
}

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT || '3000', 10);

// Validate JWT Secret
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (NODE_ENV === 'production') {
    console.error('[FATAL SECURITY ERROR] JWT_SECRET environment variable is required in production mode!');
    process.exit(1);
  } else {
    JWT_SECRET = 'syndx-dev-secret-do-not-use-in-production-min32chars!!';
    console.warn('[Security Warning] JWT_SECRET not configured. Using insecure development default. DO NOT use this in production.');
  }
}

// Parse Allowed CORS Origins
const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const rawCors = process.env.CORS_ORIGIN;
const CORS_ORIGINS = rawCors
  ? rawCors.split(',').map(s => s.trim()).filter(Boolean)
  : defaultOrigins;

// Database Path
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, '..', '..', 'data', 'syndx_production.db');

// External ML Inference Microservice (FastAPI Port 8000)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// Default Admin Seed Password
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'password123';

module.exports = {
  NODE_ENV,
  PORT,
  JWT_SECRET,
  CORS_ORIGINS,
  DB_PATH,
  ML_SERVICE_URL,
  DEFAULT_ADMIN_PASSWORD
};
