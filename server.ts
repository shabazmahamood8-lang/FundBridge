import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/config/db.js';
import { initSeedData } from './server/services/dataStore.js';
import apiRoutes from './server/routes/api.js';
import { handleStripeWebhook } from './server/controllers/paymentController.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security & Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for flexible iframed previews and external image CDNs
    crossOriginEmbedderPolicy: false,
  })
);

// Production CORS: strictly allow only configured frontend origin
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigin : true,
    credentials: true,
  })
);

// Stripe webhook route needs raw body for cryptographic signature verification BEFORE express.json()
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes Mounted First
app.use('/api', apiRoutes);

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FundBridge] Server running on http://0.0.0.0:${PORT}`);
  });

  // Connect to DB and seed initial baseline data in background
  connectDB()
    .then(() => initSeedData())
    .catch((err) => {
      console.warn('[Database] Initial connection error:', err);
    });
}

startServer();
