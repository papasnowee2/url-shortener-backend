import app from './app.js';
import config from './config/index.js';
import connectDB from './db/connect.js';

async function start() {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`[server] listening on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  }
}

start();
