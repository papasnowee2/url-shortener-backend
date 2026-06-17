const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('./config');
const userRoutes = require('./routes/user.routes');
const shortnerRoutes = require('./routes/shortner.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/users', userRoutes);
app.use('/shortner', shortnerRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
