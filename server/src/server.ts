import { config } from './config';
import app from './app';
import { connectDB } from './lib/prisma';

async function start() {
  const dbConnected = await connectDB();

  if (!dbConnected) {
    console.error('⚠️  Server starting without database — some features will not work.');
  }

  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });
}

start();
