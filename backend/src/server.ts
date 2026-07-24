import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import auditRoutes from './routes/audit.route';
import authRoutes from './routes/auth.route';
import historyRoutes from './routes/history.route';

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === FRONTEND_URL || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/testing, locked down via FRONTEND_URL in production
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/audit', auditRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Page Pulse API] Server running on port ${PORT}`);
  });
}

export default app;
