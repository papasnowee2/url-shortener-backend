import app from './app.js';
import config from './config/index.js';
import connectDB from './db/connect.js';

async function start(): Promise<void> {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`[server] listening on http://localhost:${config.port}`);
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[server] failed to start:', message);
    process.exit(1);
  }
}

start();
