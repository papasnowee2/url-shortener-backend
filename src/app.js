import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from './config/index.js';
import userRoutes from './routes/user.routes.js';
import shortnerRoutes from './routes/shortner.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

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

export default app;
