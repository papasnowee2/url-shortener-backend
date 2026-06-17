const app = require('./app');
const config = require('./config');
const connectDB = require('./db/connect');

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
