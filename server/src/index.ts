import "dotenv/config";
import express from 'express';
import cors from 'cors';
import authRoute from './route/authRoute.js';
import projectRoute from './route/projectRoute.js';
import monitorRoute from './route/monitorRoute.js';

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
