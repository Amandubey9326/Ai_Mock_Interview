import dotenv from 'dotenv';

dotenv.config();

// These have sensible defaults — app can start without .env
export const config = {
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/hiremind_ai?replicaSet=rs0',
  jwtSecret: process.env.JWT_SECRET || 'hiremind-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  port: parseInt(process.env.PORT || '5001', 10),
};

// Warn about missing keys but don't crash
if (!config.geminiApiKey) {
  console.warn('⚠️  GEMINI_API_KEY not set — AI features will not work. Get a free key at https://aistudio.google.com/apikey');
}
