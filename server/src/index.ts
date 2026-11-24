import "dotenv/config";
import express from 'express';
import cors from 'cors';
import { Redis } from 'ioredis';
import authRoute from './route/authRoute.js';
import projectRoute from './route/projectRoute.js';
import monitorRoute from './route/monitorRoute.js';

// Background BullMQ worker only runs in long-running environments (local / VPS), not inside Vercel serverless functions
if (!process.env.VERCEL) {
  import("./worker/monitorWorker.js").catch((err) => {
    console.error("Failed to initialize monitor worker:", err);
  });
}

const app = express();

app.use(express.json());

// Allow client origin or fallback to allow all during development
const clientUrl = process.env.CLIENT_URL;
app.use(cors({
  origin: clientUrl ? [clientUrl.replace(/\/$/, ''), 'http://localhost:5173'] : true,
  credentials: true
}));

// Root health check for Vercel
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API Monitor Server is running' });
});

// Dedicated Redis connection and health check endpoint
app.get('/api/redis-health', async (req, res) => {
  const redisUrlStr = process.env.REDIS_URL;
  if (!redisUrlStr) {
    return res.status(500).json({
      ok: false,
      error: 'REDIS_URL environment variable is not defined',
      isVercel: !!process.env.VERCEL,
    });
  }

  let host = 'unknown';
  try {
    const parsed = new URL(redisUrlStr);
    host = parsed.hostname;
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: `Invalid REDIS_URL format: ${e.message}`,
      isVercel: !!process.env.VERCEL,
    });
  }

  const startTime = Date.now();
  let client: Redis | null = null;
  try {
    client = new Redis(redisUrlStr, {
      connectTimeout: 4000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      lazyConnect: false,
      ...(redisUrlStr.startsWith('rediss://') ? { tls: { servername: host } } : {}),
    });

    const ping = await Promise.race([
      client.ping(),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Redis ping timed out after 4000ms')), 4000)
      ),
    ]);

    await client.quit().catch(() => client?.disconnect());

    return res.status(200).json({
      ok: true,
      ping,
      host,
      latencyMs: Date.now() - startTime,
      isVercel: !!process.env.VERCEL,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (client) {
      try { client.disconnect(); } catch {}
    }
    return res.status(500).json({
      ok: false,
      error: err.message || 'Failed to connect to Redis',
      host,
      latencyMs: Date.now() - startTime,
      isVercel: !!process.env.VERCEL,
      checkedAt: new Date().toISOString(),
    });
  }
});

// Routes
app.use('/api/auth', authRoute);
app.use('/api/projects', projectRoute);
app.use('/api/monitors', monitorRoute);

// When running locally, start the HTTP server. On Vercel, serverless handles the port.
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
