import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PORT = 3001;
const DEFAULT_JWT_EXPIRES_IN = '7d';
const DEFAULT_BCRYPT_ROUNDS = 10;
// Số lớp proxy đứng trước backend. Chạy trực tiếp thì 1 là đủ; sau
// cloudflared + Nginx thì phải là 2 (xem docker-compose.yml).
const DEFAULT_TRUST_PROXY = 1;

/**
 * Reads a required variable and fails fast if it is missing.
 * Starting without a DB URI or a JWT secret is never recoverable,
 * so it is better to crash at boot than to serve broken requests.
 */
function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? DEFAULT_PORT),
  mongoUri: required('MONGO_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? DEFAULT_JWT_EXPIRES_IN,
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? DEFAULT_BCRYPT_ROUNDS),
  trustProxy: Number(process.env.TRUST_PROXY ?? DEFAULT_TRUST_PROXY),
  // Comma-separated list so staging and production can share one image.
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

export const isProduction = env.nodeEnv === 'production';
